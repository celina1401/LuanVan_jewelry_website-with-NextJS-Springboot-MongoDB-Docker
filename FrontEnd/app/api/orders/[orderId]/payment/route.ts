import { NextRequest, NextResponse } from 'next/server';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:9003';

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    
    // Extract payment status and transaction ID from request body
    const { paymentStatus, transactionId } = body;
    
    // Build query parameters for the backend
    const queryParams = new URLSearchParams();
    queryParams.append('paymentStatus', paymentStatus);
    if (transactionId) {
      queryParams.append('transactionId', transactionId);
    }
    
    const response = await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/payment?${queryParams.toString()}`, {
      method: 'PUT',
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating order payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update order payment status' },
      { status: 500 }
    );
  }
}