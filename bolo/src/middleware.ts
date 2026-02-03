import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Don't interfere with auth pages - let them handle their own redirects
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/register')) {
    return NextResponse.next();
  }
  
  // Dashboard protection - for now, allow access (session is in localStorage)
  // In production, you'd want proper cookie-based auth
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  // Remove dashboard from matcher - no protection for now
  matcher: ['/login', '/register'],
};
