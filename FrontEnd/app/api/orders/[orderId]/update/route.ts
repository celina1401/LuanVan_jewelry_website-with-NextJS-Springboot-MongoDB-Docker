// app/api/orders/[orderId]/update/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:9003';

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
    let url = `${ORDER_SERVICE_URL}/api/orders/${orderId}/${action}`;
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
    
    console.log('Making request to Order Service:', url);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
    });

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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update order' },
      { status: 500 }
    );
  }
}
