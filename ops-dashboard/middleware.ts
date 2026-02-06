// Version: 1.2.4 - PIN Security Implementation (No Supabase dependency in middleware)
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, internal next and auth api
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('favicon.ico') ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // 2. PIN Protection Logic
  const authPin = request.cookies.get("auth_pin")?.value;
  const isLoginPage = pathname === "/login";

  if (authPin === "464321") {
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
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
