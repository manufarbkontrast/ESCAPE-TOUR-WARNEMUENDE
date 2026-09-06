/**
 * Game session management API routes
 * GET: Fetch session by ID
 * POST: Create new session from booking code
 * PATCH: Update session (pause/resume/complete)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import {
  successResponse,
  errorResponse,
  toNextResponse,
  toNextResponseWithCookies,
} from '@/lib/utils/api-response';
import type { NextRequest } from 'next/server';
import type { Database } from '@escape-tour/database/src/types/supabase';
import type { Puzzle, Station } from '@escape-tour/shared';
import type { DatabaseRow } from '@/lib/game/mappers';
import {
  isDemoBookingCode,
  isDemoSession,
  isStaffSession,
  isValidStaffSessionId,
} from '@/lib/demo/helpers';
import { mapSessionRow, mapStationRow, mapPuzzleRowForClient } from '@/lib/game/mappers';
import {
  DEMO_SESSION_ID,
  DEMO_STATIONS,
  DEMO_PUZZLES,
  createOfflineSession,
} from '@/lib/demo/data';
import { createSessionToken, createDemoToken, SESSION_COOKIE_NAME } from '@/lib/utils/session-token';
import { verifyGameSession } from '@/lib/utils/verify-session';
import { createRateLimiter } from '@/lib/utils/rate-limit';
import { getClientIp } from '@/lib/utils/client-ip';

const SESSION_COOKIE_MAX_AGE = 86_400; // 24 hours

/** Values the session_status enum accepts. */
const ALLOWED_STATUSES: ReadonlySet<string> = new Set([
  'pending',
  'active',
  'paused',
  'completed',
  'expired',
]);

/** Upper bound for a station index — no tour comes near this. */
const MAX_STATION_INDEX = 100;

const bookingRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 5,
});

type GameSession = Database['public']['Tables']['game_sessions']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type SessionStatus = Database['public']['Enums']['session_status'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A session ID is acceptable if it is the demo session, a well-formed staff
 * session, or a UUID. Staff IDs used to fall through to the UUID check and
 * were rejected with 400 before ever reaching their own branch.
 */
function isAcceptableSessionId(sessionId: string): boolean {
  if (isDemoSession(sessionId)) {
    return true;
  }
  if (isStaffSession(sessionId)) {
    return isValidStaffSessionId(sessionId);
  }
  return UUID_REGEX.test(sessionId);
}

/**
 * Puzzle columns the client is allowed to see.
 *
 * `correct_answer` is deliberately absent: answers are checked server-side,
 * so shipping the column would hand every solution to anyone who opens the
 * network tab.
 */
const CLIENT_PUZZLE_COLUMNS = [
  'id',
  'station_id',
  'order_index',
  'puzzle_type',
  'difficulty',
  'question_de',
  'question_en',
  'instruction_de',
  'instruction_en',
  'answer_type',
  'answer_validation_mode',
  'case_sensitive',
  'options',
  'ar_content',
  'ar_marker_url',
  'audio_url',
  'image_url',
  'target_location',
  'target_radius_meters',
  'base_points',
  'time_bonus_enabled',
  'time_bonus_max_seconds',
  'created_at',
  'updated_at',
].join(',');

/**
 * Load the stations and puzzles belonging to a tour.
 *
 * The play page needs all three of session, stations and puzzles in one
 * response. A failure here is not fatal — the client can still show the
 * session — so both lists fall back to empty.
 */
async function fetchTourContent(
  supabase: ReturnType<typeof createAdminClient>,
  tourId: string,
): Promise<{ stations: Station[]; puzzles: Puzzle[] }> {
  const stationsResult = await supabase
    .from('stations')
    .select('*')
    .eq('tour_id', tourId)
    .order('order_index');

  if (stationsResult.error) {
    console.error('Stations fetch error:', stationsResult.error);
    return { stations: [], puzzles: [] };
  }

  const stationRows = (stationsResult.data ?? []) as DatabaseRow[];
  const stations = stationRows.map(mapStationRow);

  if (stations.length === 0) {
    return { stations, puzzles: [] };
  }

  const puzzlesResult = await supabase
    .from('puzzles')
    .select(CLIENT_PUZZLE_COLUMNS)
    .in(
      'station_id',
      stations.map((station) => station.id),
    )
    .order('order_index');

  if (puzzlesResult.error) {
    console.error('Puzzles fetch error:', puzzlesResult.error);
    return { stations, puzzles: [] };
  }

  const puzzleRows = (puzzlesResult.data ?? []) as DatabaseRow[];
  return { stations, puzzles: puzzleRows.map(mapPuzzleRowForClient) };
}

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
    const supabase = createAdminClient();
    const sessionId = request.nextUrl.searchParams.get('id');

    if (!sessionId) {
      return toNextResponse(errorResponse('Missing session ID'), 400);
    }

    // Validate ID format (UUID, demo session or staff session)
    if (!isAcceptableSessionId(sessionId)) {
      return toNextResponse(errorResponse('Invalid session ID format'), 400);
    }

    // Verify session ownership
    const auth = verifyGameSession(request, sessionId);
    if (!auth.valid) {
      return toNextResponse(errorResponse(auth.error ?? 'Unauthorized'), 401);
    }

    // Demo and staff mode: return mock data without touching Supabase
    if (isDemoSession(sessionId) || isStaffSession(sessionId)) {
      return toNextResponse(
        successResponse({
          session: createOfflineSession(sessionId),
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

    // The client expects { session, stations, puzzles } in the shared
    // camelCase shape — the same envelope the demo branch returns above.
    const mappedSession = mapSessionRow(session as DatabaseRow);
    const { stations, puzzles } = await fetchTourContent(supabase, mappedSession.tourId);

    return toNextResponse(
      successResponse({ session: mappedSession, stations, puzzles }),
    );
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
    const supabase = createAdminClient();
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
      // /play navigates to result.data.sessionId; without that field the
      // guest lands on /play/undefined.
      return toNextResponseWithCookies(
        successResponse({
          sessionId: existingSession.id,
          id: existingSession.id,
          status: existingSession.status,
        }),
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
    const mappedSession = mapSessionRow(createdSession as DatabaseRow);
    return toNextResponseWithCookies(
      successResponse({ ...mappedSession, sessionId: mappedSession.id }),
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
 * Has this session at least reached the tour's final station?
 *
 * This raises the bar rather than closing the hole: the station index is also
 * client-supplied, so it can be walked up before claiming completion. Closing
 * it properly needs per-station progress recorded server-side by the
 * validate-answer edge function.
 */
async function hasReachedLastStation(
  supabase: ReturnType<typeof createAdminClient>,
  sessionId: string,
  requestedStationIndex: number | undefined,
): Promise<boolean> {
  const { data: sessionRow, error } = await supabase
    .from('game_sessions')
    .select('tour_id, current_station_index')
    .eq('id', sessionId)
    .single();

  if (error || !sessionRow) {
    return false;
  }

  const row = sessionRow as { tour_id: string; current_station_index: number | null };

  const stationsResult = await supabase
    .from('stations')
    .select('id')
    .eq('tour_id', row.tour_id);

  const stationCount = (stationsResult.data ?? []).length;
  if (stationsResult.error || stationCount === 0) {
    // Without a station list there is nothing to check against; let it pass
    // rather than block a real finish on a failed lookup.
    return true;
  }

  const reachedIndex = Math.max(
    row.current_station_index ?? 0,
    requestedStationIndex ?? 0,
  );

  return reachedIndex >= stationCount - 1;
}

/**
 * PATCH /api/game/session
 * Update session state (pause/resume/complete)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = (await request.json()) as UpdateSessionRequest;

    if (!body.sessionId) {
      return toNextResponse(errorResponse('Missing session ID'), 400);
    }

    // Validate ID format (UUID, demo session or staff session)
    if (!isAcceptableSessionId(body.sessionId)) {
      return toNextResponse(errorResponse('Invalid session ID format'), 400);
    }

    // Verify session ownership
    const auth = verifyGameSession(request, body.sessionId);
    if (!auth.valid) {
      return toNextResponse(errorResponse(auth.error ?? 'Unauthorized'), 401);
    }

    // Demo and staff sessions live in localStorage only — accept the update
    // and echo the mock session back.
    if (isDemoSession(body.sessionId) || isStaffSession(body.sessionId)) {
      return toNextResponse(successResponse(createOfflineSession(body.sessionId)));
    }

    // Validate at the boundary. These values went straight into the UPDATE
    // before, so a bad enum or a string in a numeric column produced a
    // Postgres error and a 500 — which session-sync retries, sending it twice.
    if (
      body.status !== undefined &&
      (typeof body.status !== 'string' || !ALLOWED_STATUSES.has(body.status))
    ) {
      return toNextResponse(errorResponse('Invalid status'), 400);
    }

    if (
      body.currentStationIndex !== undefined &&
      (!Number.isInteger(body.currentStationIndex) ||
        body.currentStationIndex < 0 ||
        body.currentStationIndex > MAX_STATION_INDEX)
    ) {
      return toNextResponse(errorResponse('Invalid currentStationIndex'), 400);
    }

    // A client could set 'completed' straight after starting and then collect
    // a certificate for zero solved puzzles. Require that the last station has
    // at least been reached.
    if (body.status === 'completed') {
      const reachedLastStation = await hasReachedLastStation(
        supabase,
        body.sessionId,
        body.currentStationIndex,
      );

      if (!reachedLastStation) {
        return toNextResponse(
          errorResponse('Die Tour ist noch nicht an der letzten Station angekommen.'),
          400,
        );
      }
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

    return toNextResponse(
      successResponse(mapSessionRow(updateResult.data as DatabaseRow)),
    );
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
