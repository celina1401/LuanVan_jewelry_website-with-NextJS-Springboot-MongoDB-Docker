import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; 

const ORDER_SERVICE_URL = 'http://localhost:9003';

// GET /api/orders/[orderId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> } // Note the Promise type
) {
  const { orderId } = await params; // Await params before destructuring

  if (!orderId) {
    return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });
  }

  try {
    // Kiểm tra xem orderId có phải là orderNumber (bắt đầu bằng chữ cái) hay không
    let url = `${ORDER_SERVICE_URL}/api/orders`;
    
    if (/^[A-Z]/.test(orderId)) {
      // Nếu bắt đầu bằng chữ cái, coi như là orderNumber
      url = `${ORDER_SERVICE_URL}/api/orders/number/${orderId}`;
    } else {
      // Nếu không, coi như là id
      url = `${ORDER_SERVICE_URL}/api/orders/${orderId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      const text = await response.text();
      throw new Error(`OrderService error ${response.status}: ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET Order Error]', { orderId, message: (error as Error).message });
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/orders/[orderId]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> } // Update type here as well
) {
  const { orderId } = await context.params; // Await params

  if (!orderId) {
    return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      const text = await response.text();
      throw new Error(`OrderService error ${response.status}: ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PUT Order Error]', { orderId, message: (error as Error).message });
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/orders/[orderId]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> } // Update type here as well
) {
  const { orderId } = await context.params; // Await params

  if (!orderId) {
    return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });
  }

  try {
    const response = await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      const text = await response.text();
      throw new Error(`OrderService error ${response.status}: ${text}`);
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('[DELETE Order Error]', { orderId, message: (error as Error).message });
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}