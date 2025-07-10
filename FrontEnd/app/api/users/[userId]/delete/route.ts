import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  try {
    await clerkClient.users.deleteUser(userId);
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
} 