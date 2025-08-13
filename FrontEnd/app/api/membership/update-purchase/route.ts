import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, orderAmount } = await request.json();

    if (!userId || !orderAmount) {
      return NextResponse.json(
        { error: 'Thiếu thông tin userId hoặc orderAmount' },
        { status: 400 }
      );
    }

    // Gọi API từ UserService để cập nhật thông tin mua hàng
    const response = await fetch(`http://localhost:9001/api/membership/${userId}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderAmount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Không thể cập nhật thông tin mua hàng' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating purchase info:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi cập nhật thông tin mua hàng' },
      { status: 500 }
    );
  }
}