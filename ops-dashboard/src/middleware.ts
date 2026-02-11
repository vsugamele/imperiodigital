import { NextResponse, type NextRequest } from "next/server";

const AUTH_PIN = process.env.AUTH_PIN || "464321";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authPin = request.cookies.get("auth_pin")?.value;
  const isLoginPage = pathname === "/login";

  if (authPin === AUTH_PIN) {
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
