// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware(async (auth: any, request: NextRequest) => {
//   const userId = auth?.userId;
//   const sessionClaims = auth?.sessionClaims;

//   // Handle admin routes
//   if (request.nextUrl.pathname.startsWith("/admin")) {
//     if (!userId) {
//       // Redirect to login if not authenticated
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     // Kiểm tra role từ session claims
//     const userRole = (sessionClaims?.publicMetadata as { role?: string })?.role;
    
//     if (userRole !== "admin") {
//       // Redirect to home if not admin
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   }

//   // Handle API routes that require authentication
//   // API routes will be protected by the backend, but we can add an initial check here
//   if (request.nextUrl.pathname.startsWith("/api/")) {
//      // Optional: Add basic check for authenticated users accessing API routes
//      if (!userId) {
//        return new NextResponse(
//          JSON.stringify({ error: "Unauthorized" }),
//          { status: 401, headers: { "Content-Type": "application/json" } }
//        );
//      }
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!.+\\.[\\w]+$|_next|login/sso-callback|login/sign-in).*)", 
//     "/", 
//     "/(api|trpc)(.*)"
//   ],
// };
// middleware.ts
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
