/**
 * GET /api/booking/status?session_id=xxx
 * Fetches booking details after Stripe Checkout completes
 * Used by the confirmation page to show booking code
 */

import type { NextRequest } from 'next/server'
import type { Database } from '@escape-tour/database/src/types/supabase'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, toNextResponse } from '@/lib/utils/api-response'

type BookingRow = Database['public']['Tables']['bookings']['Row']

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')

    if (!sessionId) {
      return toNextResponse(errorResponse('Missing session_id'), 400)
    }

    // Fetch Stripe session to get payment intent
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return toNextResponse(errorResponse('Zahlung noch nicht abgeschlossen'), 402)
    }

    const paymentIntentId = session.payment_intent as string

    if (!paymentIntentId) {
      return toNextResponse(errorResponse('Kein Payment Intent gefunden'), 404)
    }

    // Look up booking by payment intent
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('bookings')
      .select()
      .eq('payment_intent_id', paymentIntentId)
      .maybeSingle()

    const booking = data as BookingRow | null

    if (error) {
      console.error('Booking lookup error:', error)
      return toNextResponse(errorResponse('Fehler beim Laden der Buchung'), 500)
    }

    if (!booking) {
      // Webhook might not have processed yet — tell the client to retry
      return toNextResponse(errorResponse('Buchung wird noch verarbeitet'), 202)
    }

    const tourVariant = session.metadata?.tourVariant ?? 'adult'

    return toNextResponse(
      successResponse({
        bookingCode: booking.booking_code,
        contactEmail: booking.contact_email,
        teamName: booking.team_name,
        participantCount: booking.participant_count,
        scheduledDate: booking.scheduled_date,
        amountCents: booking.amount_cents,
        tourVariant,
      }),
    )
  } catch (error) {
    console.error('Booking status error:', error)
    return toNextResponse(
      errorResponse(
        error instanceof Error ? error.message : 'Fehler beim Laden der Buchung'
      ),
      500,
    )
  }
}
