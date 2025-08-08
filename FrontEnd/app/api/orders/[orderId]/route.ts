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
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    console.log(`Fetching order: ${orderId}`);

    // Determine the correct endpoint based on orderId format
    let path = '/api/orders';
    
    if (/^[A-Z]/.test(orderId)) {
      // If it starts with a letter, treat as orderNumber
      path = `/api/orders/number/${orderId}`;
    } else {
      // Otherwise, treat as id
      path = `/api/orders/${orderId}`;
    }

    try {
      const response = await makeOrderServiceRequest(path, {
        method: 'GET'
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        const errorText = await response.text();
        console.error(`OrderService GET error: ${response.status} - ${errorText}`);
        
        if (response.status === 500) {
          return NextResponse.json(
            { error: 'Order service internal error - please try again later' },
            { status: 503 }
          );
        }
        
        throw new Error(`OrderService error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timeout when fetching order');
        return NextResponse.json(
          { error: 'Request timeout - Order service may be unavailable' },
          { status: 503 }
        );
      }
      
      if (fetchError instanceof Error && fetchError.message.includes('ECONNREFUSED')) {
        console.error('Connection refused - Order service may not be running');
        return NextResponse.json(
          { error: 'Order service is not available. Please ensure the backend services are running. You can start them with: docker-compose up -d' },
          { status: 503 }
        );
      }
      
      // Handle other network errors
      if (fetchError instanceof Error) {
        console.error('Network error when fetching order:', fetchError.message);
        return NextResponse.json(
          { error: 'Network error - please check your connection and ensure backend services are running' },
          { status: 503 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('[GET Order Error]', { orderId: params, message: (error as Error).message });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch order' },
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

    try {
      const response = await makeOrderServiceRequest(`/api/orders/${orderId}`, {
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

    try {
      const response = await makeOrderServiceRequest(`/api/orders/${orderId}`, {
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