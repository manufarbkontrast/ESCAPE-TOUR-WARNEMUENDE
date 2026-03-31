import { createHmac, timingSafeEqual } from 'crypto'

export const STAFF_TOKEN_STORAGE_KEY = 'escape-tour-staff-token' as const
const STAFF_TOKEN_MAX_AGE_S = 28_800 // 8 hours

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

function hmacSign(payload: string): string {
  return createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url')
}

export function createStaffToken(): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = hmacSign(`staff:${timestamp}`)
  return `staff:${timestamp}:${signature}`
}

export function verifyStaffToken(token: string): boolean {
  const parts = token.split(':')
  if (parts.length !== 3 || parts[0] !== 'staff') return false

  const timestamp = parseInt(parts[1], 10)
  if (isNaN(timestamp)) return false

  const now = Math.floor(Date.now() / 1000)
  if (now - timestamp > STAFF_TOKEN_MAX_AGE_S) return false

  const expectedSignature = hmacSign(`staff:${timestamp}`)
  const sigBuf = Buffer.from(parts[2])
  const expectedBuf = Buffer.from(expectedSignature)

  if (sigBuf.length !== expectedBuf.length) return false

  return timingSafeEqual(sigBuf, expectedBuf)
}

/** Client-side only: check if token timestamp is still valid (no HMAC check) */
export function isStaffTokenFresh(token: string): boolean {
  const parts = token.split(':')
  if (parts.length !== 3 || parts[0] !== 'staff') return false
  const timestamp = parseInt(parts[1], 10)
  if (isNaN(timestamp)) return false
  const now = Math.floor(Date.now() / 1000)
  return now - timestamp <= STAFF_TOKEN_MAX_AGE_S
}
