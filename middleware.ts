import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl.clone();

  // 1. Protect Admin UI
  if (url.pathname.startsWith("/admin")) {
    if (!auth) {
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
  }

  // 2. Protect Admin API
  if (url.pathname.startsWith("/api/admin")) {
    if (!auth) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 3. Optionally guard all other API routes
  if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/admin")) {
    if (!auth) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
