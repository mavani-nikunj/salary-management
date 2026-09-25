import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Public unauthenticated routes
const publicAuthRoutes = ["/", "/forgot-password", "/reset-password"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Skip Next.js internal files, NextAuth API callbacks, and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Read NextAuth JWT token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isPublicAuthRoute = publicAuthRoutes.includes(pathname);

  // 3. If NOT authenticated and requesting a protected route, redirect to login (/)
  if (!token && !isPublicAuthRoute) {
    const loginUrl = new URL("/", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. If ALREADY authenticated and visiting login (/), redirect to /dashboard
  if (token && isPublicAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Support both 'proxy' and 'middleware' function name exports for compatibility
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, public files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
