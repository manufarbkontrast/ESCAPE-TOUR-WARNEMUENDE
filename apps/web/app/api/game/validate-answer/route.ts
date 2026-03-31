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
import { isDemoSession, isStaffSession, validateDemoAnswer } from '@/lib/demo/helpers';
import { verifyGameSession } from '@/lib/utils/verify-session';
import { createRateLimiter } from '@/lib/utils/rate-limit';
import { getClientIp } from '@/lib/utils/client-ip';

const answerRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 10,
});

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

    const MAX_ANSWER_LENGTH = 1000;

    // Verify session ownership
    if (body.sessionId) {
      const auth = verifyGameSession(request, body.sessionId);
      if (!auth.valid) {
        return toNextResponse(errorResponse(auth.error ?? 'Unauthorized'), 401);
      }
    }

    if (!body.sessionId || !body.puzzleId || body.answer === undefined) {
      return toNextResponse(
        errorResponse('Missing required fields: sessionId, puzzleId, answer'),
        400
      );
    }

    // Validate answer size
    const answerStr = Array.isArray(body.answer) ? body.answer.join('') : body.answer;
    if (typeof answerStr === 'string' && answerStr.length > MAX_ANSWER_LENGTH) {
      return toNextResponse(
        errorResponse('Answer exceeds maximum length'),
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

    // Rate limit answer attempts (skip for demo/staff)
    if (!isDemoSession(body.sessionId) && !isStaffSession(body.sessionId)) {
      const ip = getClientIp(request);
      const rateCheck = answerRateLimiter.check(`${ip}:${body.sessionId}`);
      if (!rateCheck.allowed) {
        const retryAfter = Math.ceil(rateCheck.retryAfterMs / 1000);
        const res = toNextResponse(
          errorResponse('Too many attempts. Please try again later.'),
          429,
        );
        res.headers.set('Retry-After', String(retryAfter));
        return res;
      }
    }

    // Demo/Staff mode: validate against local demo data without touching Supabase
    if (isDemoSession(body.sessionId) || isStaffSession(body.sessionId)) {
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
        errorResponse('Validation failed'),
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
        'An unexpected error occurred'
      ),
      500
    );
  }
}
