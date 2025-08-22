// app/api/orders/[orderId]/update/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:9003';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:9001';

function buildCandidates(primary: string, dockerHostname: string, defaultPort: number): string[] {
  const candidates = new Set<string>();
  candidates.add(primary);
  if (primary.includes('localhost')) {
    candidates.add(primary.replace('localhost', '127.0.0.1'));
  }
  const dockerUrl = `http://${dockerHostname}:${defaultPort}`;
  candidates.add(dockerUrl);
  return Array.from(candidates);
}

async function fetchWithFallback(urlBuilder: (baseUrl: string) => string, init: RequestInit, candidates: string[]): Promise<{ response: Response; baseUrl: string }> {
  let lastError: any = null;
  for (const base of candidates) {
    const url = urlBuilder(base);
    try {
      console.log('Making request to Order Service:', url);
      const response = await fetch(url, init);
      if (response.ok) {
        return { response, baseUrl: base };
      }
      // If not ok but reachable, return immediately to surface backend error
      return { response, baseUrl: base };
    } catch (e) {
      lastError = e;
      console.error('Order Service fetch failed for', url, e);
      continue;
    }
  }
  throw lastError || new Error('All Order Service endpoints failed');
}

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    
    console.log('Update order request:', { orderId, body });
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    const { action, ...updateData } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: 'action is required in request body' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['status', 'payment', 'shipping'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    const token = getAuthToken(request);
    
    // Build URL with query parameters based on action
    // Backend expects:
    // - status: /orders/{orderId}/status
    // - payment: /orders/{orderId}/payment
    // - shipping: /orders/{orderNumber}/shipping
    let pathId = orderId;
    if (action === 'shipping') {
      // The UI may pass orderNumber as param in this route for shipping updates
      // Keep as-is; backend controller maps shipping by orderNumber
      pathId = orderId; 
    }
    let url = `${ORDER_SERVICE_URL}/api/orders/${pathId}/${action}`;
    const queryParams = new URLSearchParams();
    
    if (action === 'status' && updateData.orderStatus) {
      queryParams.append('orderStatus', updateData.orderStatus);
    } else if (action === 'payment') {
      if (updateData.paymentStatus) {
        queryParams.append('paymentStatus', updateData.paymentStatus);
      }
      if (updateData.transactionId) {
        queryParams.append('transactionId', updateData.transactionId);
      }
    } else if (action === 'shipping' && updateData.shippingStatus) {
      queryParams.append('shippingStatus', updateData.shippingStatus);
    }
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const candidates = buildCandidates(ORDER_SERVICE_URL, 'orderservice', 9003);
    const { response } = await fetchWithFallback(
      (base) => {
        // Rebuild URL with candidate base
        const u = new URL(url);
        const baseUrl = new URL(base);
        return `${baseUrl.origin}${u.pathname}${u.search}`;
      },
      { method: 'PUT', headers },
      candidates
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OrderService update error: ${response.status} - ${errorText}`);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to update order: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Order updated successfully:', data);

    // After successful update, try to fetch order details to determine if membership should be updated
    try {
      // Helper to fetch order details by id or orderNumber
      const fetchOrderDetails = async (): Promise<any | null> => {
        // Try as database id first
        const tryUrls = [
          `${ORDER_SERVICE_URL}/api/orders/${orderId}`,
          `${ORDER_SERVICE_URL}/api/orders/number/${orderId}`,
        ];
        for (const u of tryUrls) {
          try {
            const res = await fetch(u, { headers });
            if (res.ok) {
              return await res.json();
            }
          } catch (e) {
            // continue
          }
        }
        return null;
      };

      const order = await fetchOrderDetails();
      if (order) {
        const shippingStatusText: string = String(order.shippingStatus || order.orderStatus || '').toLowerCase();
        const paymentStatusText: string = String(order.paymentStatus || '').toLowerCase();

        const isDelivered = /đã\s*giao/.test(shippingStatusText) || /delivered/.test(shippingStatusText);
        const isPaid = /đã\s*thanh\s*toán/.test(paymentStatusText) || /paid/.test(paymentStatusText);

        // Check if order is completed (both delivered and paid)
        const isCompleted = isDelivered && isPaid;
        
        // Update membership if order is completed and has required data
        if (isCompleted && order.userId && (order.total ?? order.totalAmount ?? order.amount)) {
          const orderAmount = Number(order.total ?? order.totalAmount ?? order.amount);
          try {
            const membershipRes = await fetch(`${USER_SERVICE_URL}/api/users/membership/${order.userId}/purchase`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderAmount, orderId: order.id ?? orderId, orderNumber: order.orderNumber ?? undefined }),
            });

            if (!membershipRes.ok) {
              const errText = await membershipRes.text();
              console.error('Failed to update membership purchase:', membershipRes.status, errText);
            } else {
              console.log('Membership purchase counted successfully');
            }
          } catch (e) {
            console.error('Error calling membership purchase API:', e);
          }
        }
      } else {
        console.warn('Could not fetch order details to evaluate membership update');
      }
    } catch (postErr) {
      console.error('Post-update membership evaluation error:', postErr);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update order' },
      { status: 500 }
    );
  }
}
