import { NextRequest, NextResponse } from 'next/server';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:9001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    console.log(`Checking status for user ${userId}`);

    const response = await fetch(`${USER_SERVICE_URL}/api/users/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`UserService status check error: ${response.status} - ${errorText}`);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      throw new Error(`UserService error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check user status' },
      { status: 500 }
    );
  }
} 