// Version: 2.0.0 - PIN Security with Environment Variable
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PIN = process.env.AUTH_PIN || "000000";

// Use experimental-edge runtime as requested by Next.js build
export const runtime = 'experimental-edge';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authPin = request.cookies.get("auth_pin")?.value;
  const isLoginPage = pathname === "/login";

  // 1. PIN Protection
  if (authPin === AUTH_PIN) {
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. Not authenticated
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
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Any file with an extension (e.g. .png, .jpg, .svg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};
