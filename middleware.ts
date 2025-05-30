import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth: any, request: NextRequest) => {
  // Access userId and sessionClaims safely
  const userId = auth?.userId;
  const sessionClaims = auth?.sessionClaims;

  // Handle admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const userRole = (sessionClaims?.publicMetadata as { role?: string })?.role;
    
    if (!userId) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (userRole !== "admin") {
      // Redirect to home if not admin
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 