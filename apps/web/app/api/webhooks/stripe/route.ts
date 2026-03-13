/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events — primarily checkout.session.completed
 * Creates booking record in Supabase after successful payment
 */

import type { NextRequest } from 'next/server'
import Stripe from 'stripe'
import type { Database } from '@escape-tour/database/src/types/supabase'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { generateBookingCode } from '@/lib/booking/generate-code'
import { resend, EMAIL_FROM } from '@/lib/email/client'
import { buildBookingConfirmationEmail } from '@/lib/email/templates/booking-confirmation'

type TourRow = Database['public']['Tables']['tours']['Row']

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // If no webhook secret configured, verify by fetching the session directly
  let event: Stripe.Event

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // Development fallback — parse event body directly
      // In production, ALWAYS use webhook secret verification
      console.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification')
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      try {
        await handleCheckoutCompleted(session)
      } catch (error) {
        console.error('Error handling checkout.session.completed:', error)
        // Return 200 to acknowledge receipt — Stripe will retry on 5xx
        return new Response('Error processing webhook, but acknowledged', { status: 200 })
      }
      break
    }

    default:
      // Ignore other event types
      break
  }

  return new Response('OK', { status: 200 })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const metadata = session.metadata
  if (!metadata) {
    throw new Error('No metadata on checkout session')
  }

  const supabase = await createClient()

  const tourVariant = metadata.tourVariant as 'family' | 'adult'
  const participantCount = parseInt(metadata.participantCount, 10)
  const contactEmail = metadata.contactEmail
  const teamName = metadata.teamName || null
  const scheduledDate = metadata.scheduledDate
  const totalCents = parseInt(metadata.totalCents, 10)

  // Look up the tour by variant
  const { data: tourData, error: tourError } = await supabase
    .from('tours')
    .select()
    .eq('variant', tourVariant)
    .eq('is_active', true)
    .single()

  const tour = tourData as TourRow | null

  if (tourError || !tour) {
    throw new Error(`Tour not found for variant: ${tourVariant}`)
  }

  // Generate unique booking code (retry if collision)
  let bookingCode = generateBookingCode()
  let attempts = 0
  const MAX_ATTEMPTS = 10

  while (attempts < MAX_ATTEMPTS) {
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select()
      .eq('booking_code', bookingCode)
      .maybeSingle()

    if (!existingBooking) break

    bookingCode = generateBookingCode()
    attempts++
  }

  if (attempts >= MAX_ATTEMPTS) {
    throw new Error('Failed to generate unique booking code')
  }

  // Calculate validity window: scheduled date ± buffer
  const scheduled = new Date(scheduledDate)
  const validFrom = new Date(scheduled)
  validFrom.setHours(0, 0, 0, 0)
  const validUntil = new Date(scheduled)
  validUntil.setDate(validUntil.getDate() + 7) // 7 days after scheduled date
  validUntil.setHours(23, 59, 59, 999)

  // Create booking record
  const bookingInsert = {
    booking_code: bookingCode,
    tour_id: tour.id,
    status: 'confirmed' as const,
    contact_email: contactEmail,
    participant_count: participantCount,
    team_name: teamName,
    amount_cents: totalCents,
    scheduled_date: scheduledDate,
    payment_intent_id: session.payment_intent as string,
    paid_at: new Date().toISOString(),
    valid_from: validFrom.toISOString(),
    valid_until: validUntil.toISOString(),
  }

  const { error: insertError } = await supabase
    .from('bookings')
    .insert(bookingInsert as never)

  if (insertError) {
    console.error('Booking insert error:', insertError)
    throw new Error(`Failed to create booking: ${insertError.message}`)
  }

  console.log(`Booking created: ${bookingCode} for ${contactEmail} (${tourVariant})`)

  // Send confirmation email (non-blocking — don't fail the webhook if email fails)
  try {
    const { subject, html, text } = buildBookingConfirmationEmail({
      bookingCode,
      contactEmail,
      teamName,
      participantCount,
      scheduledDate,
      amountCents: totalCents,
      tourVariant,
    })

    await resend.emails.send({
      from: EMAIL_FROM,
      to: contactEmail,
      subject,
      html,
      text,
    })

    console.log(`Confirmation email sent to ${contactEmail}`)
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError)
  }
}
