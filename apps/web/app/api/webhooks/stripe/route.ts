/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events — primarily checkout.session.completed
 * Creates booking record in Supabase after successful payment
 */

import type { NextRequest } from 'next/server'
import Stripe from 'stripe'
import type { Database } from '@escape-tour/database/src/types/supabase'
import { stripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateBookingCode } from '@/lib/booking/generate-code'
import { generateVoucherCode, voucherValidUntil } from '@/lib/vouchers/voucher'
import { buildVoucherEmail } from '@/lib/email/templates/voucher'
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

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return new Response('Webhook not configured', { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      try {
        // A voucher has no date and no booking — different row, different mail.
        if (session.metadata?.kind === 'voucher') {
          await handleVoucherCompleted(session)
        } else {
          await handleCheckoutCompleted(session)
        }
      } catch (error) {
        // 5xx makes Stripe redeliver for up to three days. Acknowledging with
        // 200 here meant a paid guest could end up with no booking at all and
        // no second attempt. handleCheckoutCompleted is idempotent, so a
        // redelivery cannot duplicate the booking.
        console.error('Error handling checkout.session.completed:', {
          eventId: event.id,
          error,
        })
        return new Response('Processing failed', { status: 500 })
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

  // checkout.session.completed also fires for delayed payment methods (SEPA,
  // Klarna, Sofort) before the money has arrived. Booking on 'unpaid' would
  // hand out a free tour.
  if (session.payment_status !== 'paid') {
    console.log('Checkout session not paid yet, skipping', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
    })
    return
  }

  const supabase = createAdminClient()
  const paymentIntentId = session.payment_intent as string

  // Stripe delivers at least once. Without this check a redelivery created a
  // second booking with a second code for the same payment.
  if (paymentIntentId) {
    const { data: alreadyBooked } = await supabase
      .from('bookings')
      .select('id')
      .eq('payment_intent_id', paymentIntentId)
      .maybeSingle()

    if (alreadyBooked) {
      console.log('Checkout session already processed, skipping', {
        eventPaymentIntent: paymentIntentId,
      })
      return
    }
  }

  const tourVariant = metadata.tourVariant as 'family' | 'adult' | 'pro'
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
    payment_intent_id: paymentIntentId,
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

  // The booking code is the only credential needed to start a paid tour, so
  // it must not end up in long-lived PM2 logs. Same for the plain address.
  console.log('Booking created', {
    tourVariant,
    participantCount,
    paymentIntentId,
  })

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

    console.log('Confirmation email sent', { paymentIntentId })
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError)
  }
}

/**
 * Creates the voucher after Stripe confirms the payment.
 *
 * Mirrors handleCheckoutCompleted: nothing is created before the money has
 * arrived, and a redelivered event must not produce a second voucher.
 */
async function handleVoucherCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const metadata = session.metadata
  if (!metadata) {
    throw new Error('No metadata on voucher checkout session')
  }

  if (session.payment_status !== 'paid') {
    console.log('Voucher session not paid yet, skipping', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
    })
    return
  }

  const supabase = createAdminClient()
  const paymentIntentId = session.payment_intent as string

  if (paymentIntentId) {
    const { data: existing } = await supabase
      .from('vouchers')
      .select('id')
      .eq('payment_intent_id', paymentIntentId)
      .maybeSingle()

    if (existing) {
      console.log('Voucher already issued for this payment, skipping', {
        eventPaymentIntent: paymentIntentId,
      })
      return
    }
  }

  const tourVariant = metadata.tourVariant
  const participantCount = parseInt(metadata.participantCount, 10)
  const purchaserEmail = metadata.purchaserEmail
  const recipientName = metadata.recipientName || null
  const giftMessage = metadata.giftMessage || null

  if (!Number.isInteger(participantCount) || participantCount < 1) {
    throw new Error(`Invalid participantCount on voucher session: ${metadata.participantCount}`)
  }

  const code = generateVoucherCode()

  const insert = {
    code,
    tour_variant: tourVariant,
    participant_count: participantCount,
    // Source of truth is what Stripe actually charged, not our metadata.
    amount_cents: session.amount_total ?? parseInt(metadata.totalCents, 10),
    purchaser_email: purchaserEmail,
    recipient_name: recipientName,
    message: giftMessage,
    payment_intent_id: paymentIntentId,
    paid_at: new Date().toISOString(),
    valid_until: voucherValidUntil(),
  }

  const { error: insertError } = await supabase.from('vouchers').insert(insert as never)

  if (insertError) {
    console.error('Voucher insert error:', insertError)
    throw new Error(`Failed to create voucher: ${insertError.message}`)
  }

  console.log('Voucher issued', { tourVariant, participantCount, paymentIntentId })

  // A failed email must not fail the webhook — the voucher exists, and a
  // retry would be blocked by the idempotency check anyway.
  try {
    const { subject, html, text } = buildVoucherEmail({
      code,
      tourVariant,
      participantCount,
      recipientName,
      giftMessage,
      validUntil: insert.valid_until,
    })

    await resend.emails.send({
      from: EMAIL_FROM,
      to: purchaserEmail,
      subject,
      html,
      text,
    })

    console.log('Voucher email sent', { paymentIntentId })
  } catch (emailError) {
    console.error('Failed to send voucher email:', emailError)
  }
}
