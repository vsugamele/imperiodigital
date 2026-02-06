// Version: 1.2.3 - PIN Security Implementation
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Skip static assets
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // 2. PIN Protection Logic
  const authPin = request.cookies.get("auth_pin")?.value;
  const isLoginPage = pathname === "/login";

  if (!authPin || authPin !== "464321") {
    if (!isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3. Optional: Supabase Session Refresh (if still using Supabase)
  let response = NextResponse.next({ request });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    await supabase.auth.getUser();
  }

  // 4. Redirect logged in users away from login page
  if (isLoginPage && authPin === "464321") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
