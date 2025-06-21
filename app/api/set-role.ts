import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return new NextResponse('Missing userId or role', { status: 400 });
    }

    // Log để debug
    console.log('Updating user:', userId, 'with role:', role);

    const result = await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });

    console.log('Update result:', result);

    return NextResponse.json({ success: true, message: `Role "${role}" set for user ${userId}` });
  } catch (error) {
    console.error('Error setting role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
