import type { NextRequest } from 'next/server'
import { isDemoSession } from '@/lib/demo/helpers'
import { SESSION_COOKIE_NAME, verifySessionToken, isDemoToken } from './session-token'

interface VerifyResult {
  readonly valid: boolean
  readonly error?: string
}

export function verifyGameSession(
  request: NextRequest,
  sessionId: string,
): VerifyResult {
  // Demo sessions bypass auth
  if (isDemoSession(sessionId)) {
    return { valid: true }
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return { valid: false, error: 'Missing session token' }
  }

  // Reject demo tokens for non-demo sessions
  if (isDemoToken(token)) {
    return { valid: false, error: 'Invalid session token' }
  }

  if (!verifySessionToken(token, sessionId)) {
    return { valid: false, error: 'Invalid session token' }
  }

  return { valid: true }
}
