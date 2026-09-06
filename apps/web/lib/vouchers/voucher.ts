/**
 * Gift vouchers ("Erlebnisgutschein").
 *
 * A voucher buys a concrete tour for a concrete number of people — "Familien-
 * Tour für 2 Personen". The recipient picks the date later. That maps onto the
 * existing booking flow: redeeming a voucher creates a normal booking, just
 * without a payment.
 *
 * Everything that decides whether a voucher may be used lives here, so the
 * booking page, the checkout route and support all answer the same way.
 */

import { randomInt } from 'crypto'
import type { TourVariantId } from '@/lib/config/tours'

/**
 * Alphabet without characters that get misread when a code is read out over
 * the phone: no O/0, no I/L/1.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Two groups of four, so it can be dictated in chunks. */
const GROUP_LENGTH = 4
const GROUP_COUNT = 2

/** `GS-` marks it as a voucher — booking codes are six bare characters. */
const PREFIX = 'GS-'

export const VOUCHER_CODE_PATTERN = /^GS-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/

/** Matches the twelve months the AGB promise for booking codes. */
export const VOUCHER_VALIDITY_MONTHS = 12

/**
 * Generates a voucher code.
 *
 * Uses crypto.randomInt rather than Math.random: the code is the only thing
 * protecting a paid tour, and V8's PRNG state can be reconstructed from
 * enough observed outputs.
 */
export function generateVoucherCode(): string {
  const groups = Array.from({ length: GROUP_COUNT }, () =>
    Array.from({ length: GROUP_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
  )
  return PREFIX + groups.join('-')
}

/** Expiry date for a voucher bought at `from`. */
export function voucherValidUntil(from: Date = new Date()): string {
  const until = new Date(from)
  until.setUTCMonth(until.getUTCMonth() + VOUCHER_VALIDITY_MONTHS)
  return until.toISOString()
}

/** The parts of a stored voucher the rules care about. */
export interface VoucherRecord {
  readonly code: string
  readonly tourVariant: TourVariantId
  readonly participantCount: number
  readonly validUntil: string
  readonly redeemedAt: string | null
}

export type VoucherRejection = 'redeemed' | 'expired' | 'variant' | 'participants'

export type VoucherCheck =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: VoucherRejection; readonly message: string }

const MESSAGES: Record<VoucherRejection, string> = {
  redeemed: 'Dieser Gutschein wurde bereits eingelöst.',
  expired: 'Dieser Gutschein ist abgelaufen. Meldet euch bei uns, wir finden eine Lösung.',
  variant: 'Dieser Gutschein gilt für eine andere Tour-Variante.',
  participants: 'Dieser Gutschein gilt für weniger Personen, als ihr gewählt habt.',
}

function reject(reason: VoucherRejection): VoucherCheck {
  return { ok: false, reason, message: MESSAGES[reason] }
}

/**
 * May this voucher be used for the booking the guest is about to make?
 *
 * Fewer people than covered is fine — someone dropping out must not make the
 * gift worthless. More people is not: paying the difference mid-checkout is a
 * separate flow we do not have yet.
 */
export function checkVoucher(
  voucher: VoucherRecord,
  booking: {
    readonly tourVariant: TourVariantId
    readonly participantCount: number
    readonly now?: Date
  }
): VoucherCheck {
  // Already used beats expired: it tells the guest something actionable.
  if (voucher.redeemedAt !== null) {
    return reject('redeemed')
  }

  const now = booking.now ?? new Date()
  if (new Date(voucher.validUntil).getTime() < now.getTime()) {
    return reject('expired')
  }

  if (voucher.tourVariant !== booking.tourVariant) {
    return reject('variant')
  }

  if (booking.participantCount > voucher.participantCount) {
    return reject('participants')
  }

  return { ok: true }
}
