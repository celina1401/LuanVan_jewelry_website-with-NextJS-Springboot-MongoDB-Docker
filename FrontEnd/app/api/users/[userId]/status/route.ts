import { NextRequest, NextResponse } from 'next/server';

// Try multiple possible URLs for the user service
const USER_SERVICE_URLS = [
  process.env.USER_SERVICE_URL || 'http://localhost:9001',
  'http://userservice:9001', // Docker service name
  'http://host.docker.internal:9001', // Docker host
  'http://localhost:9001' // Fallback
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    console.log(`Checking status for user ${userId}`);

    // Try multiple URLs
    let lastError: Error | null = null;
    
    for (const baseUrl of USER_SERVICE_URLS) {
      try {
        const url = `${baseUrl}/api/users/users/${userId}`;
        console.log(`Trying to connect to: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout per attempt
        });
        
        if (response.ok) {
          console.log(`Successfully connected to: ${url}`);
          const data = await response.json();
          return NextResponse.json(data);
        }
        
        if (response.status === 404) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }
        
        lastError = new Error(`HTTP ${response.status} from ${url}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.log(`Failed to connect to ${baseUrl}: ${lastError.message}`);
        continue;
      }
    }
    
    // If all URLs failed
    console.error('Error checking user status:', lastError);
    return NextResponse.json(
      { error: 'User service is not available. Please ensure the backend services are running. You can start them with: docker-compose up -d' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check user status' },
      { status: 500 }
    );
  }
} 