import { NextRequest, NextResponse } from 'next/server';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:9001';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { active } = body;

    console.log(`Toggling lock for user ${userId} to active: ${active}`);

    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(`${USER_SERVICE_URL}/api/users/${userId}/toggle-lock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timeout when toggling user lock');
        return NextResponse.json(
          { error: 'Request timeout - User service may be unavailable' },
          { status: 503 }
        );
      }
      
      if (fetchError instanceof Error && fetchError.message.includes('ECONNREFUSED')) {
        console.error('Connection refused - User service may not be running');
        return NextResponse.json(
          { error: 'User service is not available - please try again later' },
          { status: 503 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error toggling user lock:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle user lock' },
      { status: 500 }
    );
  }
} 