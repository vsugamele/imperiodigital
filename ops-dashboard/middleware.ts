// Version: 2.0.0 - PIN Security with Environment Variable
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PIN = process.env.AUTH_PIN || "000000";

// Use standard edge runtime
export const runtime = 'edge';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets and internal paths
  // Using a more robust check for extensions
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('favicon.') ||
    pathname.includes('icon-') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.jpeg') ||
    pathname.includes('.ico') ||
    pathname.includes('.svg')
  ) {
    return NextResponse.next();
  }

  // 2. PIN Protection Logic
  const authPin = request.cookies.get("auth_pin")?.value;
  const isLoginPage = pathname === "/login";

  if (authPin === AUTH_PIN) {
    if (isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Not authenticated
  if (!isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth api)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|favicon.png|.*\\.).*)',
  ],
};
