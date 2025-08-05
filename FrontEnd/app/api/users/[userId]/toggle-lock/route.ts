import { NextRequest, NextResponse } from 'next/server';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:9001';

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();
    const { active } = body;

    console.log(`Toggling lock for user ${userId} to active: ${active}`);

    const response = await fetch(`${USER_SERVICE_URL}/api/users/${userId}/toggle-lock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`UserService toggle-lock error: ${response.status} - ${errorText}`);
      
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
    console.error('Error toggling user lock:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle user lock' },
      { status: 500 }
    );
  }
} 