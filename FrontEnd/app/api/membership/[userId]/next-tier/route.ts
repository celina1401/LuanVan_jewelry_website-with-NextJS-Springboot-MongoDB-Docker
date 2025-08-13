import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu userId' },
        { status: 400 }
      );
    }

    // Gọi API từ UserService để lấy thông tin hạng tiếp theo
    const response = await fetch(`http://localhost:9001/api/users/membership/${userId}/next-tier`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Không thể lấy thông tin hạng tiếp theo' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching next tier info:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy thông tin hạng tiếp theo' },
      { status: 500 }
    );
  }
}
