// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { makeServiceRequest } from '@/lib/service-urls';

// Helper function to get auth token from request headers
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Helper function to make authenticated requests to Order Service with fallback
async function makeOrderServiceRequest(
  path: string, 
  options: RequestInit, 
  token?: string | null
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as HeadersInit),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await makeServiceRequest('order', path, {
      ...options,
      headers,
      signal: AbortSignal.timeout(5000), // 5 second timeout per attempt
    }, process.env.ORDER_SERVICE_URL);
    
    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      throw new Error('Connection refused - Order service may not be running');
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    
    const token = getAuthToken(request);
    
    let path = '/api/orders';
    
    // Route to different endpoints based on parameters
    if (orderId) {
      path = `/api/orders/${orderId}`;
    } else if (orderNumber) {
      path = `/api/orders/number/${orderNumber}`;
    } else if (userId) {
      path = `/api/orders/user/${userId}`;
    }
    
    console.log('Fetching from Order Service:', path);
    
    try {
      const response = await makeOrderServiceRequest(path, { 
        method: 'GET'
      }, token);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OrderService GET error: ${response.status} - ${errorText}`);
        
        if (response.status === 404) {
          return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
          );
        }
        
        // Return a more specific error for 500 status
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
        console.error('Request timeout when fetching orders');
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
        console.error('Network error when fetching orders:', fetchError.message);
        return NextResponse.json(
          { error: 'Network error - please check your connection and ensure backend services are running' },
          { status: 503 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = getAuthToken(request);
    
    console.log('Creating order with data:', JSON.stringify(body, null, 2));
    
    const response = await makeOrderServiceRequest(
      '/api/orders',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      token
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OrderService POST error: ${response.status} - ${errorText}`);
      throw new Error(`OrderService error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Order created successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const token = getAuthToken(request);
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Deleting order:', orderId);
    
    const response = await makeOrderServiceRequest(
      `/api/orders/${orderId}`,
      { method: 'DELETE' },
      token
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OrderService DELETE error: ${response.status} - ${errorText}`);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      
      throw new Error(`OrderService error: ${response.status} - ${errorText}`);
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete order' },
      { status: 500 }
    );
  }
}
 