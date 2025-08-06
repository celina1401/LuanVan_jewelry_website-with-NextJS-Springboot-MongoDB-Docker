import { NextRequest, NextResponse } from 'next/server';

const ORDER_SERVICE_URL = 'http://localhost:9003';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    // Gọi API tạo hóa đơn từ OrderService
    const response = await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('[POST Invoice Error]', { message: (error as Error).message });
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
} 