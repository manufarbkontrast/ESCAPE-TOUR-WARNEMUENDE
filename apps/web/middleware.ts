/**
 * Next.js middleware for Supabase auth and route protection
 * Refreshes auth session and protects game routes
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Middleware to handle auth session refresh and route protection
 */
export async function middleware(request: NextRequest) {
  const { supabaseResponse } = await updateSession(request);

  // Protected routes that require a valid booking session
  const isPlayRoute = request.nextUrl.pathname.startsWith('/play/');

  if (isPlayRoute) {
    // Session validation will be handled by the page component
    // which will redirect if the session is invalid
    // Middleware just ensures auth cookies are fresh
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
