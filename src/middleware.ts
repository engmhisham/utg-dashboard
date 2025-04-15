// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login';
  const isProtectedRoute = [
    '/dashboard',
    '/clients',
    '/brands',
    '/emails',
    '/team',
    '/seo',
    '/seo/general',
    '/seo/pages',
    '/testimonials',
    '/contact',
    '/faqs',
  ].some(route => pathname.startsWith(route));
  console.log('[Middleware] Path:', pathname, '| Authenticated:', !!token);

  // ✅ If user is logged in and visits login page, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ✅ If user is not logged in and tries to access a protected route, redirect to login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// ✅ Add all protected routes to matcher
export const config = {
  matcher: [
    '/login',
    '/dashboard',
    '/clients',
    '/brands',
    '/emails',
    '/team',
    '/seo/:path*',
    '/testimonials',
    '/contact',
    '/faqs',
  ],
};
