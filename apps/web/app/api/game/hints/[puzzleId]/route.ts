/**
 * GET /api/game/hints/[puzzleId]
 * Fetches available hints for a specific puzzle
 */

import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  toNextResponse,
} from '@/lib/utils/api-response'
import type { NextRequest } from 'next/server'
import { isDemoPuzzle } from '@/lib/demo/helpers'
import { DEMO_HINTS } from '@/lib/demo/data'
import { verifyGameSession } from '@/lib/utils/verify-session'

interface RouteContext {
  readonly params: Promise<{ readonly puzzleId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { puzzleId } = await context.params

    if (!puzzleId) {
      return toNextResponse(errorResponse('Missing puzzleId parameter'), 400)
    }

    // Verify session ownership via query param
    const sessionId = request.nextUrl.searchParams.get('sessionId')
    if (sessionId) {
      const auth = verifyGameSession(request, sessionId)
      if (!auth.valid) {
        return toNextResponse(errorResponse(auth.error ?? 'Unauthorized'), 401)
      }
    }

    // Demo mode: return mock hints without touching Supabase
    if (isDemoPuzzle(puzzleId)) {
      const hints = DEMO_HINTS.get(puzzleId) ?? []
      return toNextResponse(successResponse(hints))
    }

    const supabase = await createClient()

    const { data: hints, error } = await supabase
      .from('hints')
      .select('*')
      .eq('puzzle_id', puzzleId)
      .order('hint_level', { ascending: true })

    if (error) {
      console.error('Hints fetch error:', error)
      return toNextResponse(
        errorResponse('Failed to fetch hints'),
        500,
      )
    }

    return toNextResponse(successResponse(hints ?? []))
  } catch (error) {
    console.error('Hints endpoint error:', error)
    return toNextResponse(
      errorResponse(
        'An unexpected error occurred',
      ),
      500,
    )
  }
}
