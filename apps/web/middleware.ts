/**
 * Next.js middleware for Supabase auth and route protection
 * Refreshes auth session and protects game routes
 */

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/** Routes that require an authenticated Supabase user */
const ADMIN_ROUTES = ['/dashboard', '/buchungen'];

/**
 * Middleware to handle auth session refresh and route protection
 */
export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // Protect admin routes — redirect to /login if not authenticated
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if (isAdminRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
