/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session for a tour booking
 */

import type { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { successResponse, errorResponse, toNextResponse } from '@/lib/utils/api-response'

interface CheckoutRequest {
  readonly tourVariant: 'family' | 'adult'
  readonly participantCount: number
  readonly contactEmail: string
  readonly teamName?: string
  readonly scheduledDate: string
}

// Tour configuration — must match database tours table
const TOUR_CONFIG = {
  family: {
    name: 'Escape Tour Warnemünde – Familien-Tour',
    priceCents: 2490,
    description: 'Das Vermächtnis des Lotsenkapitäns (ab 8 Jahren)',
  },
  adult: {
    name: 'Escape Tour Warnemünde – Erwachsenen-Tour',
    priceCents: 2990,
    description: 'Das Vermächtnis des Lotsenkapitäns (ab 14 Jahren)',
  },
} as const

function calculateGroupDiscount(count: number): number {
  if (count >= 10) return 0.15
  if (count >= 6) return 0.10
  return 0
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutRequest

    // Validate required fields
    if (!body.tourVariant || !body.participantCount || !body.contactEmail || !body.scheduledDate) {
      return toNextResponse(errorResponse('Fehlende Pflichtfelder'), 400)
    }

    if (body.participantCount < 1 || body.participantCount > 20) {
      return toNextResponse(errorResponse('Teilnehmeranzahl muss zwischen 1 und 20 liegen'), 400)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.contactEmail)) {
      return toNextResponse(errorResponse('Ungültige E-Mail-Adresse'), 400)
    }

    const config = TOUR_CONFIG[body.tourVariant]
    if (!config) {
      return toNextResponse(errorResponse('Ungültige Tour-Variante'), 400)
    }

    // Calculate price with group discount
    const discount = calculateGroupDiscount(body.participantCount)
    const unitPrice = Math.round(config.priceCents * (1 - discount))
    const totalCents = unitPrice * body.participantCount

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: body.contactEmail,
      locale: 'de',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: unitPrice,
            product_data: {
              name: config.name,
              description: config.description,
            },
          },
          quantity: body.participantCount,
        },
      ],
      metadata: {
        tourVariant: body.tourVariant,
        participantCount: String(body.participantCount),
        contactEmail: body.contactEmail,
        teamName: body.teamName ?? '',
        scheduledDate: body.scheduledDate,
        totalCents: String(totalCents),
      },
      success_url: `${appUrl}/buchen/bestaetigung?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/buchen?variant=${body.tourVariant}&cancelled=true`,
    })

    return toNextResponse(
      successResponse({ sessionId: session.id, url: session.url }),
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return toNextResponse(
      errorResponse(
        error instanceof Error ? error.message : 'Fehler beim Erstellen der Checkout-Sitzung'
      ),
      500,
    )
  }
}
