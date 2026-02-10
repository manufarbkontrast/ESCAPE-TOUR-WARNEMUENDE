/**
 * POST /api/game/validate-answer
 * Validates a puzzle answer via Supabase Edge Function
 */

import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  toNextResponse,
} from '@/lib/utils/api-response';
import type { NextRequest } from 'next/server';
import { isDemoSession, validateDemoAnswer } from '@/lib/demo/helpers';

type ValidateAnswerRequest = {
  readonly sessionId: string;
  readonly puzzleId: string;
  readonly answer: string | string[];
  readonly timeSeconds?: number;
  readonly timeSpentSeconds?: number;
};

type ValidateAnswerResponse = {
  readonly correct: boolean;
  readonly points: number;
  readonly timeBonus: number;
  readonly feedback?: string;
};

/**
 * Validate a puzzle answer
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse and validate request body
    const body = (await request.json()) as ValidateAnswerRequest;

    if (!body.sessionId || !body.puzzleId || body.answer === undefined) {
      return toNextResponse(
        errorResponse('Missing required fields: sessionId, puzzleId, answer'),
        400
      );
    }

    const timeSeconds = body.timeSpentSeconds ?? body.timeSeconds ?? 0;

    if (typeof timeSeconds !== 'number' || timeSeconds < 0) {
      return toNextResponse(
        errorResponse('Invalid timeSeconds: must be a non-negative number'),
        400
      );
    }

    // Demo mode: validate against local demo data without touching Supabase
    if (isDemoSession(body.sessionId)) {
      const result = validateDemoAnswer(body.puzzleId, body.answer, timeSeconds);
      return toNextResponse(successResponse(result));
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke<ValidateAnswerResponse>(
      'validate-answer',
      {
        body: {
          sessionId: body.sessionId,
          puzzleId: body.puzzleId,
          answer: body.answer,
          timeSeconds,
        },
      }
    );

    if (error) {
      console.error('Edge function error:', error);
      return toNextResponse(
        errorResponse(`Validation failed: ${error.message}`),
        500
      );
    }

    if (!data) {
      return toNextResponse(
        errorResponse('Edge function returned no data'),
        500
      );
    }

    return toNextResponse(successResponse(data));
  } catch (error) {
    console.error('Validate answer error:', error);
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
