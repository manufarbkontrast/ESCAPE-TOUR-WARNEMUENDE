/**
 * Tests for gift voucher codes and their validity rules.
 *
 * A voucher is the only thing standing between someone and a paid tour, so
 * the code has to be unguessable and the rules have to be decided in one
 * place rather than scattered through the checkout.
 */
import { describe, it, expect } from 'vitest'
import {
  generateVoucherCode,
  VOUCHER_CODE_PATTERN,
  VOUCHER_VALIDITY_MONTHS,
  voucherValidUntil,
  checkVoucher,
  type VoucherRecord,
} from '@/lib/vouchers/voucher'

function voucher(overrides: Partial<VoucherRecord> = {}): VoucherRecord {
  return {
    code: 'GS-ABCD-2345',
    tourVariant: 'family',
    participantCount: 2,
    validUntil: '2027-09-06T00:00:00.000Z',
    redeemedAt: null,
    ...overrides,
  }
}

const BEFORE_EXPIRY = new Date('2026-12-01T10:00:00.000Z')
const AFTER_EXPIRY = new Date('2027-12-01T10:00:00.000Z')

describe('generateVoucherCode', () => {
  it('should match the documented pattern', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(generateVoucherCode()).toMatch(VOUCHER_CODE_PATTERN)
    }
  })

  it('should be visibly different from a 6-character booking code', () => {
    // Support has to be able to tell at a glance which one a guest is holding.
    expect(generateVoucherCode().startsWith('GS-')).toBe(true)
  })

  it('should avoid characters that get misread when dictated', () => {
    // No 0/O, no 1/I/L — vouchers get read out over the phone.
    for (let i = 0; i < 50; i += 1) {
      expect(generateVoucherCode()).not.toMatch(/[OIL01]/)
    }
  })

  it('should not repeat itself', () => {
    const codes = new Set(Array.from({ length: 400 }, generateVoucherCode))
    expect(codes.size).toBe(400)
  })
})

describe('voucherValidUntil', () => {
  it('should run for the documented number of months', () => {
    const from = new Date('2026-09-06T12:00:00.000Z')
    const until = new Date(voucherValidUntil(from))

    expect(VOUCHER_VALIDITY_MONTHS).toBe(12)
    expect(until.getUTCFullYear()).toBe(2027)
    expect(until.getUTCMonth()).toBe(8)
  })
})

describe('checkVoucher', () => {
  it('should accept a valid voucher for the tour it covers', () => {
    const result = checkVoucher(voucher(), {
      tourVariant: 'family',
      participantCount: 2,
      now: BEFORE_EXPIRY,
    })

    expect(result.ok).toBe(true)
  })

  it('should accept fewer people than the voucher covers', () => {
    // Someone drops out — the voucher should not become worthless.
    const result = checkVoucher(voucher({ participantCount: 4 }), {
      tourVariant: 'family',
      participantCount: 3,
      now: BEFORE_EXPIRY,
    })

    expect(result.ok).toBe(true)
  })

  it('should refuse more people than it covers', () => {
    const result = checkVoucher(voucher({ participantCount: 2 }), {
      tourVariant: 'family',
      participantCount: 4,
      now: BEFORE_EXPIRY,
    })

    expect(result.ok).toBe(false)
    expect(result.ok === false && result.reason).toBe('participants')
  })

  it('should refuse a different tour variant', () => {
    const result = checkVoucher(voucher({ tourVariant: 'family' }), {
      tourVariant: 'pro',
      participantCount: 2,
      now: BEFORE_EXPIRY,
    })

    expect(result.ok).toBe(false)
    expect(result.ok === false && result.reason).toBe('variant')
  })

  it('should refuse an expired voucher', () => {
    const result = checkVoucher(voucher(), {
      tourVariant: 'family',
      participantCount: 2,
      now: AFTER_EXPIRY,
    })

    expect(result.ok).toBe(false)
    expect(result.ok === false && result.reason).toBe('expired')
  })

  it('should refuse a voucher that was already used', () => {
    const result = checkVoucher(voucher({ redeemedAt: '2026-10-01T10:00:00.000Z' }), {
      tourVariant: 'family',
      participantCount: 2,
      now: BEFORE_EXPIRY,
    })

    expect(result.ok).toBe(false)
    expect(result.ok === false && result.reason).toBe('redeemed')
  })

  it('should report redeemed before expired when both apply', () => {
    // "Bereits eingelöst" tells the guest something actionable; "abgelaufen"
    // on an already-used voucher just confuses.
    const result = checkVoucher(
      voucher({ redeemedAt: '2026-10-01T10:00:00.000Z' }),
      { tourVariant: 'family', participantCount: 2, now: AFTER_EXPIRY },
    )

    expect(result.ok === false && result.reason).toBe('redeemed')
  })

  it('should give every rejection a German message for the guest', () => {
    const cases = [
      checkVoucher(voucher({ redeemedAt: '2026-10-01T10:00:00.000Z' }), { tourVariant: 'family', participantCount: 2, now: BEFORE_EXPIRY }),
      checkVoucher(voucher(), { tourVariant: 'family', participantCount: 2, now: AFTER_EXPIRY }),
      checkVoucher(voucher(), { tourVariant: 'pro', participantCount: 2, now: BEFORE_EXPIRY }),
      checkVoucher(voucher(), { tourVariant: 'family', participantCount: 9, now: BEFORE_EXPIRY }),
    ]

    for (const result of cases) {
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.message.length).toBeGreaterThan(10)
      }
    }
  })
})
