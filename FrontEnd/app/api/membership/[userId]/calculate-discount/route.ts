import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { orderAmount } = await request.json();

    if (!userId || !orderAmount) {
      return NextResponse.json(
        { error: 'Thiếu userId hoặc orderAmount' },
        { status: 400 }
      );
    }

    // Gọi API từ UserService để tính discount
    const response = await fetch(`http://localhost:9001/api/users/membership/${userId}/calculate-discount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderAmount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Không thể tính discount' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error calculating discount:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi tính discount' },
      { status: 500 }
    );
  }
}
