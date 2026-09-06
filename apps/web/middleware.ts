/**
 * Next.js middleware for Supabase auth and route protection
 * Refreshes auth session and protects game routes
 */

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { isAdmin } from '@/lib/auth/roles';

/** Routes that require a signed-in user with the admin role */
const ADMIN_ROUTES = ['/dashboard', '/buchungen'];

/**
 * Middleware to handle auth session refresh and route protection
 */
export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if (isAdminRoute) {
    // Nicht eingeloggt — nach dem Login geht es an dieselbe Stelle weiter.
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Eingeloggt, aber kein Admin. Ein Redirect auf /login liefe im Kreis,
    // deshalb zurück auf die Startseite. Die Rolle steht in `app_metadata`
    // und ist nur mit dem service_role-Key setzbar — siehe lib/auth/roles.ts.
    if (!isAdmin(user)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
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
