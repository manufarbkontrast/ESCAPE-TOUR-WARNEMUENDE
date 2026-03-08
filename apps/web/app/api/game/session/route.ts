/**
 * Game session management API routes
 * GET: Fetch session by ID
 * POST: Create new session from booking code
 * PATCH: Update session (pause/resume/complete)
 */

import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  toNextResponse,
  toNextResponseWithCookies,
} from '@/lib/utils/api-response';
import type { NextRequest } from 'next/server';
import type { Database } from '@escape-tour/database/src/types/supabase';
import { isDemoBookingCode, isDemoSession } from '@/lib/demo/helpers';
import { DEMO_SESSION_ID, DEMO_SESSION, DEMO_STATIONS, DEMO_PUZZLES } from '@/lib/demo/data';
import { createSessionToken, createDemoToken, SESSION_COOKIE_NAME } from '@/lib/utils/session-token';
import { verifyGameSession } from '@/lib/utils/verify-session';
import { createRateLimiter } from '@/lib/utils/rate-limit';
import { getClientIp } from '@/lib/utils/client-ip';

const SESSION_COOKIE_MAX_AGE = 86_400; // 24 hours

const bookingRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 5,
});

type GameSession = Database['public']['Tables']['game_sessions']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type SessionStatus = Database['public']['Enums']['session_status'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type CreateSessionRequest = {
  readonly bookingCode: string;
  readonly teamName?: string;
};

type UpdateSessionRequest = {
  readonly sessionId: string;
  readonly status?: SessionStatus;
  readonly currentStationIndex?: number;
};

/**
 * GET /api/game/session?id=xxx
 * Fetch game session by ID with related data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const sessionId = request.nextUrl.searchParams.get('id');

    if (!sessionId) {
      return toNextResponse(errorResponse('Missing session ID'), 400);
    }

    // Validate ID format (UUID or demo session)
    if (!isDemoSession(sessionId) && !UUID_REGEX.test(sessionId)) {
      return toNextResponse(errorResponse('Invalid session ID format'), 400);
    }

    // Verify session ownership
    const auth = verifyGameSession(request, sessionId);
    if (!auth.valid) {
      return toNextResponse(errorResponse(auth.error ?? 'Unauthorized'), 401);
    }

    // Demo mode: return mock data without touching Supabase
    if (isDemoSession(sessionId)) {
      return toNextResponse(
        successResponse({
          session: DEMO_SESSION,
          stations: DEMO_STATIONS,
          puzzles: DEMO_PUZZLES,
        })
      );
    }

    // Fetch session
    const { data: session, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Session fetch error:', error);
      return toNextResponse(errorResponse('Session not found'), 404);
    }

    return toNextResponse(successResponse(session));
  } catch (error) {
    console.error('GET session error:', error);
    return toNextResponse(
      errorResponse(
        'Failed to fetch session'
      ),
      500
    );
  }
}

/**
 * POST /api/game/session
 * Create a new game session from a booking code
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = (await request.json()) as CreateSessionRequest;

    if (!body.bookingCode) {
      return toNextResponse(errorResponse('Missing booking code'), 400);
    }

    // Demo mode: return demo session without touching Supabase
    if (isDemoBookingCode(body.bookingCode)) {
      const sessionCookie = {
        name: SESSION_COOKIE_NAME,
        value: createDemoToken(DEMO_SESSION_ID),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: SESSION_COOKIE_MAX_AGE,
      };
      return toNextResponseWithCookies(
        successResponse({ sessionId: DEMO_SESSION_ID, id: DEMO_SESSION_ID, status: 'pending' }),
        201,
        [sessionCookie],
      );
    }

    // Rate limit booking code attempts
    const ip = getClientIp(request);
    const rateCheck = bookingRateLimiter.check(ip);
    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil(rateCheck.retryAfterMs / 1000);
      const res = toNextResponse(
        errorResponse('Too many attempts. Please try again later.'),
        429,
      );
      res.headers.set('Retry-After', String(retryAfter));
      return res;
    }

    // Validate booking code format (6 uppercase alphanumeric)
    if (!/^[A-Z0-9]{6}$/.test(body.bookingCode)) {
      return toNextResponse(
        errorResponse('Invalid booking code format'),
        400
      );
    }

    // Find booking by code
    const bookingResult = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_code', body.bookingCode)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (bookingResult.error) {
      console.error('Booking query error:', bookingResult.error);
      return toNextResponse(
        errorResponse('Failed to verify booking code'),
        500
      );
    }

    const booking = bookingResult.data as Booking | null;

    if (!booking) {
      return toNextResponse(
        errorResponse('Invalid or expired booking code'),
        404
      );
    }

    // Check if booking is still valid
    const now = new Date();
    const validFrom = booking.valid_from ? new Date(booking.valid_from) : null;
    const validUntil = booking.valid_until ? new Date(booking.valid_until) : null;

    if (validFrom && now < validFrom) {
      return toNextResponse(
        errorResponse('Booking is not yet valid'),
        400
      );
    }

    if (validUntil && now > validUntil) {
      return toNextResponse(
        errorResponse('Booking has expired'),
        400
      );
    }

    // Check for existing active session
    const existingResult = await supabase
      .from('game_sessions')
      .select('id, status')
      .eq('booking_id', booking.id)
      .in('status', ['pending', 'active', 'paused'])
      .maybeSingle();

    const existingSession = existingResult.data as { id: string; status: string } | null;
    if (existingSession) {
      const sessionCookie = {
        name: SESSION_COOKIE_NAME,
        value: createSessionToken(existingSession.id),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: SESSION_COOKIE_MAX_AGE,
      };
      return toNextResponseWithCookies(
        successResponse(existingSession),
        200,
        [sessionCookie],
      );
    }

    // Create new session
    const insertData: Database['public']['Tables']['game_sessions']['Insert'] = {
      booking_id: booking.id,
      tour_id: booking.tour_id,
      team_name: body.teamName || booking.team_name || null,
      status: 'pending',
    };

    // Type workaround: postgrest-js has difficulty inferring Insert types
    const createResult = await (supabase
      .from('game_sessions')
      .insert(insertData as never)
      .select()
      .single());

    if (createResult.error) {
      console.error('Session creation error:', createResult.error);
      return toNextResponse(
        errorResponse('Failed to create session'),
        500
      );
    }

    const createdSession = createResult.data as GameSession;
    const sessionCookie = {
      name: SESSION_COOKIE_NAME,
      value: createSessionToken(createdSession.id),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: SESSION_COOKIE_MAX_AGE,
    };
    return toNextResponseWithCookies(
      successResponse(createdSession),
      201,
      [sessionCookie],
    );
  } catch (error) {
    console.error('POST session error:', error);
    return toNextResponse(
      errorResponse(
        'Failed to create session'
      ),
      500
    );
  }
}

/**
 * PATCH /api/game/session
 * Update session state (pause/resume/complete)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = (await request.json()) as UpdateSessionRequest;

    if (!body.sessionId) {
      return toNextResponse(errorResponse('Missing session ID'), 400);
    }

    // Validate ID format (UUID or demo session)
    if (!isDemoSession(body.sessionId) && !UUID_REGEX.test(body.sessionId)) {
      return toNextResponse(errorResponse('Invalid session ID format'), 400);
    }

    // Verify session ownership
    const auth = verifyGameSession(request, body.sessionId);
    if (!auth.valid) {
      return toNextResponse(errorResponse(auth.error ?? 'Unauthorized'), 401);
    }

    // Demo mode: accept update but return mock session
    if (isDemoSession(body.sessionId)) {
      return toNextResponse(successResponse(DEMO_SESSION));
    }

    // Build update object
    const updates: Database['public']['Tables']['game_sessions']['Update'] = {
      last_activity_at: new Date().toISOString(),
    };

    if (body.status !== undefined) {
      updates.status = body.status;

      if (body.status === 'active' && !updates.started_at) {
        updates.started_at = new Date().toISOString();
      }

      if (body.status === 'paused') {
        updates.paused_at = new Date().toISOString();
      }

      if (body.status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
    }

    if (body.currentStationIndex !== undefined) {
      updates.current_station_index = body.currentStationIndex;
    }

    // Note: totalPoints, hintsUsed, puzzlesSkipped are only updated server-side
    // via the validate-answer edge function to prevent client-side manipulation.

    // Update session
    // Type workaround: postgrest-js has difficulty inferring Update types
    const updateResult = await (supabase
      .from('game_sessions')
      .update(updates as never)
      .eq('id', body.sessionId)
      .select()
      .single());

    if (updateResult.error) {
      console.error('Session update error:', updateResult.error);
      return toNextResponse(errorResponse('Failed to update session'), 500);
    }

    return toNextResponse(successResponse(updateResult.data as GameSession));
  } catch (error) {
    console.error('PATCH session error:', error);
    return toNextResponse(
      errorResponse(
        'Failed to update session'
      ),
      500
    );
  }
}
