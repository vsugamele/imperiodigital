// Version: 2.0.0 - PIN Security with Environment Variable
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PIN = process.env.AUTH_PIN || "000000";

// Use standard edge runtime
export const runtime = 'edge';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PIN Protection Logic
  const authPin = request.cookies.get("auth_pin")?.value;
  const isLoginPage = pathname === "/login";

  if (authPin === AUTH_PIN) {
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Not authenticated
  if (!isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
