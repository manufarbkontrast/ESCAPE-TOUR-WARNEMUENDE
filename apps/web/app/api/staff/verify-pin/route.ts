import type { NextRequest } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { successResponse, errorResponse, toNextResponse } from '@/lib/utils/api-response'
import { createStaffToken } from '@/lib/utils/staff-token'
import { createRateLimiter } from '@/lib/utils/rate-limit'
import { getClientIp } from '@/lib/utils/client-ip'

const pinRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 3,
})

export async function POST(request: NextRequest) {
  try {
    const staffPin = process.env.STAFF_PIN
    if (!staffPin) {
      return toNextResponse(errorResponse('Staff-Modus nicht konfiguriert'), 503)
    }

    const ip = getClientIp(request)
    const rateCheck = pinRateLimiter.check(ip)
    if (!rateCheck.allowed) {
      return toNextResponse(errorResponse('Zu viele Versuche. Bitte wartet.'), 429)
    }

    const body = (await request.json()) as { pin?: string }

    if (!body.pin || typeof body.pin !== 'string') {
      return toNextResponse(errorResponse('PIN erforderlich'), 400)
    }

    const pinBuf = Buffer.from(body.pin)
    const expectedBuf = Buffer.from(staffPin)

    const pinMatch =
      pinBuf.length === expectedBuf.length &&
      timingSafeEqual(pinBuf, expectedBuf)

    if (!pinMatch) {
      return toNextResponse(errorResponse('Falsche PIN'), 401)
    }

    const token = createStaffToken()
    return toNextResponse(successResponse({ token }))
  } catch (error) {
    console.error('Staff PIN verify error:', error)
    return toNextResponse(errorResponse('Fehler bei der Anmeldung'), 500)
  }
}
