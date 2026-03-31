import type { NextRequest } from 'next/server'
import { successResponse, errorResponse, toNextResponse, toNextResponseWithCookies } from '@/lib/utils/api-response'
import { verifyStaffToken } from '@/lib/utils/staff-token'
import { createDemoToken, SESSION_COOKIE_NAME } from '@/lib/utils/session-token'

const SESSION_COOKIE_MAX_AGE = 86_400 // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      tourType?: 'adult' | 'family'
      staffToken?: string
    }

    if (!body.staffToken || !verifyStaffToken(body.staffToken)) {
      return toNextResponse(errorResponse('Ungültiges Staff-Token'), 401)
    }

    const tourType = body.tourType ?? 'adult'
    if (tourType !== 'adult' && tourType !== 'family') {
      return toNextResponse(errorResponse('Ungültige Tour-Variante'), 400)
    }

    const sessionId = `staff-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const token = createDemoToken(sessionId)

    const response = toNextResponseWithCookies(
      successResponse({ sessionId, source: 'staff', tourType }),
      200,
      [
        {
          name: SESSION_COOKIE_NAME,
          value: token,
          options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: SESSION_COOKIE_MAX_AGE,
            path: '/',
          },
        },
      ],
    )

    return response
  } catch (error) {
    console.error('Staff session create error:', error)
    return toNextResponse(errorResponse('Fehler beim Erstellen der Session'), 500)
  }
}
