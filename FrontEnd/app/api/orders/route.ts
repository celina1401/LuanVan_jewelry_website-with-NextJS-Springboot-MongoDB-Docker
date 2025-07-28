// import { NextRequest, NextResponse } from 'next/server';

// const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:9003';

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get('userId');
    
//     let url = `${ORDER_SERVICE_URL}/api/orders`;
//     if (userId) {
//       url = `${ORDER_SERVICE_URL}/api/orders/user/${userId}`;
//     }
    
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch orders' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     console.log('Creating order with data:', JSON.stringify(body, null, 2));
    
//     const response = await fetch(`${ORDER_SERVICE_URL}/api/orders`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`OrderService error: ${response.status} - ${errorText}`);
//       throw new Error(`OrderService error: ${response.status} - ${errorText}`);
//     }

//     const data = await response.json();
//     console.log('Order created successfully:', data);
//     return NextResponse.json(data, { status: 201 });
//   } catch (error) {
//     console.error('Error creating order:', error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Failed to create order' },
//       { status: 500 }
//     );
//   }
// }

// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:9003';

// Helper function to get auth token from request headers
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Helper function to make authenticated requests to Order Service
async function makeOrderServiceRequest(
  url: string, 
  options: RequestInit, 
  token?: string | null
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as HeadersInit),
  };

  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    
    const token = getAuthToken(request);
    
    let url = `${ORDER_SERVICE_URL}/api/orders`;
    
    // Route to different endpoints based on parameters
    if (orderId) {
      url = `${ORDER_SERVICE_URL}/api/orders/${orderId}`;
    } else if (orderNumber) {
      url = `${ORDER_SERVICE_URL}/api/orders/number/${orderNumber}`;
    } else if (userId) {
      url = `${ORDER_SERVICE_URL}/api/orders/user/${userId}`;
    }
    
    console.log('Fetching from Order Service:', url);
    
    const response = await makeOrderServiceRequest(url, { method: 'GET' }, token);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OrderService GET error: ${response.status} - ${errorText}`);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      
      throw new Error(`OrderService error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
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
      `${ORDER_SERVICE_URL}/api/orders`,
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
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId parameter is required' },
        { status: 400 }
      );
    }

    const token = getAuthToken(request);
    
    const response = await makeOrderServiceRequest(
      `${ORDER_SERVICE_URL}/api/orders/${orderId}`,
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
 