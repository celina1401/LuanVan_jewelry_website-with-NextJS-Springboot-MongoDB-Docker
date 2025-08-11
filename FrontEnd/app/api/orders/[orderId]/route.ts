import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; 

// Try multiple possible URLs for the order service
const ORDER_SERVICE_URLS = [
  process.env.ORDER_SERVICE_URL || 'http://localhost:9003',
  'http://orderservice:9003', // Docker service name
  'http://host.docker.internal:9003', // Docker host
  'http://localhost:9003' // Fallback
];

// Helper function to make requests to Order Service with fallback
async function makeOrderServiceRequest(path: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as HeadersInit),
  };

  // Try multiple URLs
  let lastError: Error | null = null;
  
  for (const baseUrl of ORDER_SERVICE_URLS) {
    try {
      const url = `${baseUrl}${path}`;
      console.log(`Trying to connect to: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(5000), // 5 second timeout per attempt
      });
      
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        console.log(`Successfully connected to: ${url}`);
        return response;
      }
      
      lastError = new Error(`HTTP ${response.status} from ${url}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.log(`Failed to connect to ${baseUrl}: ${lastError.message}`);
      continue;
    }
  }
  
  throw lastError || new Error('All order service URLs failed');
}

// GET /api/orders/[orderId]
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    
    // Kiểm tra xem orderId có phải là orderNumber (bắt đầu bằng chữ) hay không
    let endpoint = '';
    if (/^[A-Z]/.test(orderId)) {
      // Nếu bắt đầu bằng chữ (như M20250729090842), đây là orderNumber
      endpoint = `/api/orders/number/${orderId}`;
    } else {
      // Nếu không, đây là orderId từ CSDL
      endpoint = `/api/orders/${orderId}`;
    }
    
    console.log(`Fetching order with endpoint: ${endpoint}`);
    
    // Sử dụng helper function để gọi OrderService với fallback URLs
    const response = await makeOrderServiceRequest(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      throw new Error(`OrderService responded with ${response.status}`);
    }

    const orderData = await response.json();
    return NextResponse.json(orderData);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[orderId]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    const body = await request.json();
    console.log(`Updating order: ${orderId}`);

    // Kiểm tra xem orderId có phải là orderNumber hay không
    let endpoint = '';
    if (/^[A-Z]/.test(orderId)) {
      // Nếu bắt đầu bằng chữ (như M20250729090842), đây là orderNumber
      endpoint = `/api/orders/number/${orderId}`;
    } else {
      // Nếu không, đây là orderId từ CSDL
      endpoint = `/api/orders/${orderId}`;
    }

    try {
      const response = await makeOrderServiceRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        const errorText = await response.text();
        console.error(`OrderService PUT error: ${response.status} - ${errorText}`);
        throw new Error(`OrderService error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.message.includes('ECONNREFUSED')) {
        console.error('Connection refused - Order service may not be running');
        return NextResponse.json(
          { error: 'Order service is not available. Please ensure the backend services are running.' },
          { status: 503 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('[PUT Order Error]', { orderId: context.params, message: (error as Error).message });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[orderId]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    console.log(`Deleting order: ${orderId}`);

    // Kiểm tra xem orderId có phải là orderNumber hay không
    let endpoint = '';
    if (/^[A-Z]/.test(orderId)) {
      // Nếu bắt đầu bằng chữ (như M20250729090842), đây là orderNumber
      endpoint = `/api/orders/number/${orderId}`;
    } else {
      // Nếu không, đây là orderId từ CSDL
      endpoint = `/api/orders/${orderId}`;
    }

    try {
      const response = await makeOrderServiceRequest(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        const errorText = await response.text();
        console.error(`OrderService DELETE error: ${response.status} - ${errorText}`);
        throw new Error(`OrderService error: ${response.status} - ${errorText}`);
      }

      return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.message.includes('ECONNREFUSED')) {
        console.error('Connection refused - Order service may not be running');
        return NextResponse.json(
          { error: 'Order service is not available. Please ensure the backend services are running.' },
          { status: 503 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('[DELETE Order Error]', { orderId: context.params, message: (error as Error).message });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete order' },
      { status: 500 }
    );
  }
}