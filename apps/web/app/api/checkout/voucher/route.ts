/**
 * POST /api/checkout/voucher
 *
 * Starts a Stripe checkout for a gift voucher. Deliberately separate from the
 * booking checkout: a voucher has no date, no team name and no group discount,
 * and mixing the two would make the working booking route harder to reason
 * about.
 *
 * The voucher row is not created here — only after Stripe confirms payment,
 * in the webhook. Nothing exists until the money has arrived.
 */

import type { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { successResponse, errorResponse, toNextResponse } from '@/lib/utils/api-response'
import { createRateLimiter } from '@/lib/utils/rate-limit'
import { getClientIp } from '@/lib/utils/client-ip'
import { getTourVariant } from '@/lib/config/tours'

const voucherRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 5,
})

/** Matches the check constraint on vouchers.participant_count. */
const MIN_PARTICIPANTS = 1
const MAX_PARTICIPANTS = 20
const MAX_EMAIL_LENGTH = 254
const MAX_NAME_LENGTH = 120
const MAX_MESSAGE_LENGTH = 500

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface VoucherCheckoutRequest {
  readonly tourVariant: string
  readonly participantCount: number
  readonly purchaserEmail: string
  readonly recipientName?: string
  readonly message?: string
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateCheck = voucherRateLimiter.check(ip)
    if (!rateCheck.allowed) {
      const res = toNextResponse(
        errorResponse('Zu viele Anfragen. Bitte wartet einen Moment.'),
        429,
      )
      res.headers.set('Retry-After', String(Math.ceil(rateCheck.retryAfterMs / 1000)))
      return res
    }

    const body = (await request.json()) as VoucherCheckoutRequest

    const variant = getTourVariant(body.tourVariant)
    if (!variant) {
      return toNextResponse(errorResponse('Ungültige Tour-Variante'), 400)
    }

    if (
      !Number.isInteger(body.participantCount) ||
      body.participantCount < MIN_PARTICIPANTS ||
      body.participantCount > MAX_PARTICIPANTS
    ) {
      return toNextResponse(
        errorResponse(`Personenzahl muss zwischen ${MIN_PARTICIPANTS} und ${MAX_PARTICIPANTS} liegen`),
        400,
      )
    }

    if (
      typeof body.purchaserEmail !== 'string' ||
      body.purchaserEmail.length > MAX_EMAIL_LENGTH ||
      !EMAIL_PATTERN.test(body.purchaserEmail)
    ) {
      return toNextResponse(errorResponse('Ungültige E-Mail-Adresse'), 400)
    }

    // Stripe caps a metadata value at 500 characters; enforcing it here turns
    // a confusing API error after payment into a clear message before it.
    if (typeof body.recipientName === 'string' && body.recipientName.length > MAX_NAME_LENGTH) {
      return toNextResponse(errorResponse('Name der beschenkten Person ist zu lang'), 400)
    }
    if (typeof body.message === 'string' && body.message.length > MAX_MESSAGE_LENGTH) {
      return toNextResponse(errorResponse('Nachricht ist zu lang'), 400)
    }

    // No group discount on vouchers: the buyer is not the group, and the
    // discount is meant to reward a big party booking one slot together.
    const totalCents = variant.priceCents * body.participantCount
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: body.purchaserEmail,
      locale: 'de',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: variant.priceCents,
            product_data: {
              name: `Gutschein: ${variant.name}`,
              description: `Escape Tour Warnemünde — ${variant.name} für ${body.participantCount} ${
                body.participantCount === 1 ? 'Person' : 'Personen'
              }`,
            },
          },
          quantity: body.participantCount,
        },
      ],
      metadata: {
        // The webhook branches on this — a booking has no `kind`.
        kind: 'voucher',
        tourVariant: variant.id,
        participantCount: String(body.participantCount),
        purchaserEmail: body.purchaserEmail,
        recipientName: body.recipientName ?? '',
        giftMessage: body.message ?? '',
        totalCents: String(totalCents),
      },
      success_url: `${appUrl}/gutschein/bestaetigung?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/gutschein?cancelled=true`,
    })

    return toNextResponse(successResponse({ sessionId: session.id, url: session.url }))
  } catch (error) {
    // Stripe messages can name the account mode and object ids — keep them in
    // the log, not in the response.
    const errorId = crypto.randomUUID()
    console.error('Voucher checkout error', { errorId, error })
    return toNextResponse(
      errorResponse(`Der Gutschein-Kauf konnte nicht gestartet werden (Ref: ${errorId})`),
      500,
    )
  }
}
