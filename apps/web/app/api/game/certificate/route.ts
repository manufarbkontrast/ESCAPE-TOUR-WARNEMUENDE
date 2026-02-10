/**
 * Game certificate API routes
 * GET: Fetch certificate for a completed session
 * POST: Generate a new certificate via Supabase Edge Function
 */

import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  toNextResponse,
} from '@/lib/utils/api-response';
import type { NextRequest } from 'next/server';
import type { Database } from '@escape-tour/database/src/types/supabase';
import { isDemoSession } from '@/lib/demo/helpers';
import { DEMO_CERTIFICATE } from '@/lib/demo/data';

type GenerateCertificateRequest = {
  readonly sessionId: string;
};

type GameSession = Database['public']['Tables']['game_sessions']['Row'];
type Certificate = Database['public']['Tables']['certificates']['Row'];

type CertificateData = {
  readonly certificateId: string;
  readonly verificationCode: string;
  readonly teamName: string;
  readonly completedAt: string;
  readonly duration: number;
  readonly totalPoints: number;
  readonly rank: string;
  readonly pdfUrl?: string;
};

/**
 * GET /api/game/certificate?sessionId=xxx
 * Fetch certificate for a completed game session
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return toNextResponse(errorResponse('Missing sessionId parameter'), 400);
    }

    // Demo mode: return mock certificate without touching Supabase
    if (isDemoSession(sessionId)) {
      return toNextResponse(successResponse(DEMO_CERTIFICATE));
    }

    const supabase = await createClient();

    // Look up existing certificate
    const certResult = await supabase
      .from('certificates')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (certResult.error) {
      console.error('Certificate fetch error:', certResult.error);
      return toNextResponse(errorResponse('Failed to fetch certificate'), 500);
    }

    const cert = certResult.data as Certificate | null;

    if (!cert) {
      return toNextResponse(errorResponse('Certificate not found'), 404);
    }

    return toNextResponse(
      successResponse({
        certificateId: cert.id,
        verificationCode: cert.verification_code,
        ...(cert.data as Record<string, unknown>),
      })
    );
  } catch (error) {
    console.error('GET certificate error:', error);
    return toNextResponse(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch certificate'
      ),
      500
    );
  }
}

/**
 * POST /api/game/certificate
 * Generate a new completion certificate for a game session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse and validate request body
    const body = (await request.json()) as GenerateCertificateRequest;

    if (!body.sessionId) {
      return toNextResponse(errorResponse('Missing session ID'), 400);
    }

    // Demo mode: return mock certificate without touching Supabase
    if (isDemoSession(body.sessionId)) {
      return toNextResponse(successResponse(DEMO_CERTIFICATE), 201);
    }

    // Verify session is completed
    const sessionResult = await supabase
      .from('game_sessions')
      .select('status, completed_at')
      .eq('id', body.sessionId)
      .maybeSingle();

    if (sessionResult.error) {
      console.error('Session query error:', sessionResult.error);
      return toNextResponse(errorResponse('Failed to fetch session'), 500);
    }

    const session = sessionResult.data as Pick<
      GameSession,
      'status' | 'completed_at'
    > | null;

    if (!session) {
      return toNextResponse(errorResponse('Session not found'), 404);
    }

    if (session.status !== 'completed') {
      return toNextResponse(
        errorResponse('Session must be completed to generate certificate'),
        400
      );
    }

    if (!session.completed_at) {
      return toNextResponse(
        errorResponse('Session completion time is missing'),
        400
      );
    }

    // Check if certificate already exists
    const certResult = await supabase
      .from('certificates')
      .select('*')
      .eq('session_id', body.sessionId)
      .maybeSingle();

    // Ignore query errors, continue to generate new certificate
    const existingCert = certResult.data as Certificate | null;

    if (!certResult.error && existingCert) {
      return toNextResponse(
        successResponse({
          certificateId: existingCert.id,
          verificationCode: existingCert.verification_code,
          ...(existingCert.data as Record<string, unknown>),
        })
      );
    }

    // Call Supabase Edge Function to generate certificate
    const { data, error } = await supabase.functions.invoke<CertificateData>(
      'generate-certificate',
      {
        body: {
          sessionId: body.sessionId,
        },
      }
    );

    if (error) {
      console.error('Edge function error:', error);
      return toNextResponse(
        errorResponse(`Certificate generation failed: ${error.message}`),
        500
      );
    }

    if (!data) {
      return toNextResponse(
        errorResponse('Edge function returned no data'),
        500
      );
    }

    return toNextResponse(successResponse(data), 201);
  } catch (error) {
    console.error('Generate certificate error:', error);
    return toNextResponse(
      errorResponse(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred'
      ),
      500
    );
  }
}
