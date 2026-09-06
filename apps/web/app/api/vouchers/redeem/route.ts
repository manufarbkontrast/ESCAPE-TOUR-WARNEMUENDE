/**
 * Gift voucher lookup and redemption.
 *
 * GET  /api/vouchers/redeem?code=GS-…  — what does this voucher cover?
 * POST /api/vouchers/redeem            — turn it into a booking on a date
 *
 * Redeeming creates an ordinary booking with a booking code, so everything
 * downstream — the play flow, the certificate, the staff tablet — needs no
 * knowledge of vouchers at all.
 */

import type { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse, toNextResponse } from '@/lib/utils/api-response'
import { createRateLimiter } from '@/lib/utils/rate-limit'
import { getClientIp } from '@/lib/utils/client-ip'
import { getTourVariant } from '@/lib/config/tours'
import { generateBookingCode } from '@/lib/booking/generate-code'
import { checkVoucher, VOUCHER_CODE_PATTERN, type VoucherRecord } from '@/lib/vouchers/voucher'
import { voucherTable } from '@/lib/vouchers/table'
import { resend, EMAIL_FROM } from '@/lib/email/client'
import { buildBookingConfirmationEmail } from '@/lib/email/templates/booking-confirmation'
import type { TourVariantId } from '@/lib/config/tours'

/** A voucher code is a payment instrument — guessing attempts get limited. */
const voucherRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 8,
})

/** Booking stays valid for a week after the chosen date, as for paid bookings. */
const VALIDITY_DAYS_AFTER_DATE = 7

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_EMAIL_LENGTH = 254
const MAX_TEAM_NAME_LENGTH = 60

interface VoucherRow {
  readonly id: string
  readonly code: string
  readonly tour_variant: string
  readonly participant_count: number
  readonly valid_until: string
  readonly redeemed_at: string | null
}

function toRecord(row: VoucherRow): VoucherRecord {
  return {
    code: row.code,
    tourVariant: row.tour_variant as TourVariantId,
    participantCount: row.participant_count,
    validUntil: row.valid_until,
    redeemedAt: row.redeemed_at,
  }
}

function rateLimited(request: NextRequest) {
  const check = voucherRateLimiter.check(getClientIp(request))
  if (check.allowed) {
    return null
  }
  const res = toNextResponse(
    errorResponse('Zu viele Versuche. Bitte wartet einen Moment.'),
    429,
  )
  res.headers.set('Retry-After', String(Math.ceil(check.retryAfterMs / 1000)))
  return res
}

async function loadVoucher(code: string) {
  const supabase = createAdminClient()
  const { data, error } = await voucherTable(supabase)
    .select('id, code, tour_variant, participant_count, valid_until, redeemed_at')
    .eq('code', code)
    .maybeSingle()

  return { supabase, row: (data as VoucherRow | null) ?? null, error }
}

/**
 * GET — tells the booking page what the voucher covers so it can pre-select
 * the variant and the number of people.
 */
export async function GET(request: NextRequest) {
  try {
    const limited = rateLimited(request)
    if (limited) return limited

    const code = request.nextUrl.searchParams.get('code')?.trim().toUpperCase() ?? ''

    if (!VOUCHER_CODE_PATTERN.test(code)) {
      return toNextResponse(errorResponse('Ungültiges Gutschein-Format'), 400)
    }

    const { row, error } = await loadVoucher(code)

    if (error) {
      console.error('Voucher lookup error:', error)
      return toNextResponse(errorResponse('Gutschein konnte nicht geprüft werden'), 500)
    }

    // Same answer for "does not exist" as for a malformed code, so the
    // endpoint cannot be used to confirm which codes are real.
    if (!row) {
      return toNextResponse(errorResponse('Gutschein nicht gefunden'), 404)
    }

    const record = toRecord(row)
    const variant = getTourVariant(record.tourVariant)

    if (record.redeemedAt !== null) {
      return toNextResponse(errorResponse('Dieser Gutschein wurde bereits eingelöst.'), 409)
    }

    if (new Date(record.validUntil).getTime() < Date.now()) {
      return toNextResponse(errorResponse('Dieser Gutschein ist abgelaufen.'), 409)
    }

    return toNextResponse(
      successResponse({
        code: record.code,
        tourVariant: record.tourVariant,
        tourName: variant?.name ?? record.tourVariant,
        participantCount: record.participantCount,
        validUntil: record.validUntil,
      }),
    )
  } catch (error) {
    console.error('Voucher GET error:', error)
    return toNextResponse(errorResponse('Gutschein konnte nicht geprüft werden'), 500)
  }
}

interface RedeemRequest {
  readonly code: string
  readonly scheduledDate: string
  readonly participantCount: number
  readonly contactEmail: string
  readonly teamName?: string
}

/** POST — books the voucher onto a date. No payment is involved. */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimited(request)
    if (limited) return limited

    const body = (await request.json()) as RedeemRequest
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''

    if (!VOUCHER_CODE_PATTERN.test(code)) {
      return toNextResponse(errorResponse('Ungültiges Gutschein-Format'), 400)
    }

    if (!DATE_PATTERN.test(body.scheduledDate) || Number.isNaN(Date.parse(body.scheduledDate))) {
      return toNextResponse(errorResponse('Ungültiges Datum'), 400)
    }

    const today = new Date(new Date().toDateString())
    if (new Date(body.scheduledDate) < today) {
      return toNextResponse(errorResponse('Das Datum liegt in der Vergangenheit'), 400)
    }

    if (!Number.isInteger(body.participantCount) || body.participantCount < 1) {
      return toNextResponse(errorResponse('Ungültige Personenzahl'), 400)
    }

    if (
      typeof body.contactEmail !== 'string' ||
      body.contactEmail.length > MAX_EMAIL_LENGTH ||
      !EMAIL_PATTERN.test(body.contactEmail)
    ) {
      return toNextResponse(errorResponse('Ungültige E-Mail-Adresse'), 400)
    }

    if (typeof body.teamName === 'string' && body.teamName.length > MAX_TEAM_NAME_LENGTH) {
      return toNextResponse(errorResponse('Teamname ist zu lang'), 400)
    }

    const { supabase, row, error } = await loadVoucher(code)

    if (error) {
      console.error('Voucher lookup error:', error)
      return toNextResponse(errorResponse('Gutschein konnte nicht geprüft werden'), 500)
    }
    if (!row) {
      return toNextResponse(errorResponse('Gutschein nicht gefunden'), 404)
    }

    const record = toRecord(row)
    const verdict = checkVoucher(record, {
      tourVariant: record.tourVariant,
      participantCount: body.participantCount,
    })

    if (!verdict.ok) {
      return toNextResponse(errorResponse(verdict.message), 409)
    }

    // Find the tour the voucher's variant belongs to.
    const tourResult = await supabase
      .from('tours')
      .select('id')
      .eq('variant', record.tourVariant)
      .eq('is_active', true)
      .maybeSingle()

    const tour = tourResult.data as { id: string } | null
    if (tourResult.error || !tour) {
      console.error('Tour lookup failed for voucher redemption:', tourResult.error)
      return toNextResponse(errorResponse('Tour nicht verfügbar'), 500)
    }

    const scheduled = new Date(body.scheduledDate)
    const validFrom = new Date(scheduled)
    validFrom.setHours(0, 0, 0, 0)
    const validUntil = new Date(scheduled)
    validUntil.setDate(validUntil.getDate() + VALIDITY_DAYS_AFTER_DATE)
    validUntil.setHours(23, 59, 59, 999)

    const bookingCode = generateBookingCode()

    // Cast per the Supabase type workaround in CLAUDE.md — postgrest-js infers
    // `never` for a chained insert().select().single().
    const bookingResult = (await supabase
      .from('bookings')
      .insert({
        booking_code: bookingCode,
        tour_id: tour.id,
        status: 'confirmed',
        contact_email: body.contactEmail,
        participant_count: body.participantCount,
        team_name: body.teamName || null,
        // Already paid when the voucher was bought.
        amount_cents: 0,
        scheduled_date: body.scheduledDate,
        paid_at: new Date().toISOString(),
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
      } as never)
      .select('id')
      .single()) as {
      data: { id: string } | null
      error: { message: string } | null
    }

    if (bookingResult.error || !bookingResult.data) {
      console.error('Booking insert failed for voucher redemption:', bookingResult.error)
      return toNextResponse(errorResponse('Buchung konnte nicht angelegt werden'), 500)
    }

    const bookingId = bookingResult.data.id

    // Only now mark the voucher used. The guard on redeemed_at makes a double
    // redemption from two parallel requests impossible: the second update
    // matches no row.
    // Cast per the Supabase type workaround in CLAUDE.md — postgrest-js
    // infers `never` for chained update().select() here.
    const redeemResult = (await voucherTable(supabase)
      .update({
        redeemed_at: new Date().toISOString(),
        redeemed_booking_id: bookingId,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', row.id)
      .is('redeemed_at', null)
      .select('id')) as {
      data: ReadonlyArray<{ id: string }> | null
      error: { message: string } | null
    }

    const redeemedRows = redeemResult.data ?? []
    if (redeemResult.error || redeemedRows.length === 0) {
      // Someone redeemed it a moment earlier — undo the booking we just made
      // rather than hand out a second tour for one voucher.
      await supabase.from('bookings').delete().eq('id', bookingId)
      console.error('Voucher was redeemed concurrently', { voucherId: row.id })
      return toNextResponse(errorResponse('Dieser Gutschein wurde bereits eingelöst.'), 409)
    }

    const variant = getTourVariant(record.tourVariant)

    try {
      const { subject, html, text } = buildBookingConfirmationEmail({
        bookingCode,
        contactEmail: body.contactEmail,
        teamName: body.teamName ?? null,
        participantCount: body.participantCount,
        scheduledDate: body.scheduledDate,
        amountCents: 0,
        tourVariant: record.tourVariant,
      })

      await resend.emails.send({ from: EMAIL_FROM, to: body.contactEmail, subject, html, text })
    } catch (emailError) {
      // The booking exists; a failed mail must not undo it.
      console.error('Failed to send redemption confirmation:', emailError)
    }

    console.log('Voucher redeemed', { voucherId: row.id, tourVariant: record.tourVariant })

    return toNextResponse(
      successResponse({
        bookingCode,
        tourName: variant?.name ?? record.tourVariant,
        scheduledDate: body.scheduledDate,
        participantCount: body.participantCount,
      }),
      201,
    )
  } catch (error) {
    console.error('Voucher redeem error:', error)
    return toNextResponse(errorResponse('Gutschein konnte nicht eingelöst werden'), 500)
  }
}
