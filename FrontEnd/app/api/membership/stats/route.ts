import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Gọi API từ UserService để lấy thống kê hạng thành viên
    const response = await fetch(`http://localhost:9001/api/users/membership/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Không thể lấy thống kê hạng thành viên' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching membership stats:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy thống kê hạng thành viên' },
      { status: 500 }
    );
  }
}
