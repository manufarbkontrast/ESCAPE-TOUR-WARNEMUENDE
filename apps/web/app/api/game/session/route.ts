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
} from '@/lib/utils/api-response';
import type { NextRequest } from 'next/server';
import type { Database } from '@escape-tour/database/src/types/supabase';

type GameSession = Database['public']['Tables']['game_sessions']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type SessionStatus = Database['public']['Enums']['session_status'];

type CreateSessionRequest = {
  readonly bookingCode: string;
  readonly teamName?: string;
};

type UpdateSessionRequest = {
  readonly sessionId: string;
  readonly status?: SessionStatus;
  readonly currentStationIndex?: number;
  readonly totalPoints?: number;
  readonly hintsUsed?: number;
  readonly puzzlesSkipped?: number;
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
        error instanceof Error ? error.message : 'Failed to fetch session'
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

    if (existingResult.data) {
      return toNextResponse(successResponse(existingResult.data));
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

    return toNextResponse(successResponse(createResult.data as GameSession), 201);
  } catch (error) {
    console.error('POST session error:', error);
    return toNextResponse(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to create session'
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

    if (body.totalPoints !== undefined) {
      updates.total_points = body.totalPoints;
    }

    if (body.hintsUsed !== undefined) {
      updates.hints_used = body.hintsUsed;
    }

    if (body.puzzlesSkipped !== undefined) {
      updates.puzzles_skipped = body.puzzlesSkipped;
    }

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
        error instanceof Error ? error.message : 'Failed to update session'
      ),
      500
    );
  }
}
