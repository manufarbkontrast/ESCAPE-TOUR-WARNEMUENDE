import { createHmac, timingSafeEqual } from 'crypto'

export const SESSION_COOKIE_NAME = 'game-session-token' as const

const DEMO_TOKEN_VALUE = 'demo'

function getSecret(): string {
  const secret = process.env.SESSION_TOKEN_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_TOKEN_SECRET is required in production')
    }
    return 'dev-secret-do-not-use-in-production'
  }
  return secret
}

function hmacSign(sessionId: string): string {
  return createHmac('sha256', getSecret())
    .update(sessionId)
    .digest('base64url')
}

export function createSessionToken(sessionId: string): string {
  const signature = hmacSign(sessionId)
  return `${sessionId}:${signature}`
}

export function verifySessionToken(
  token: string,
  expectedSessionId: string,
): boolean {
  const colonIndex = token.indexOf(':')
  if (colonIndex === -1) return false

  const tokenSessionId = token.slice(0, colonIndex)
  const tokenSignature = token.slice(colonIndex + 1)

  if (tokenSessionId !== expectedSessionId) return false

  const expectedSignature = hmacSign(expectedSessionId)

  const sigBuf = Buffer.from(tokenSignature)
  const expectedBuf = Buffer.from(expectedSignature)

  if (sigBuf.length !== expectedBuf.length) return false

  return timingSafeEqual(sigBuf, expectedBuf)
}

export function isDemoToken(token: string): boolean {
  return token.endsWith(`:${DEMO_TOKEN_VALUE}`)
}

export function createDemoToken(sessionId: string): string {
  return `${sessionId}:${DEMO_TOKEN_VALUE}`
}
