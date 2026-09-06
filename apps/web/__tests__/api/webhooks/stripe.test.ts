/**
 * Tests for POST /api/webhooks/stripe.
 *
 * This route handles money. It had no tests at all, which is how it ended up
 * acknowledging failures with HTTP 200 — telling Stripe "handled" for a
 * booking that was never created.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockQueryBuilder } from '../../helpers/mock-supabase'

const { mockClient, mockConstructEvent, mockSendEmail, mockGenerateCode } = vi.hoisted(() => {
  const createDefaultBuilder = () => {
    const builder = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      in: vi.fn(),
      order: vi.fn(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
      then: vi.fn(),
    }
    const result = { data: null, error: null }
    builder.select.mockReturnValue(builder)
    builder.insert.mockReturnValue(builder)
    builder.update.mockReturnValue(builder)
    builder.delete.mockReturnValue(builder)
    builder.eq.mockReturnValue(builder)
    builder.in.mockReturnValue(builder)
    builder.order.mockReturnValue(builder)
    builder.single.mockResolvedValue(result)
    builder.maybeSingle.mockResolvedValue(result)
    builder.then.mockImplementation((onfulfilled?: (value: typeof result) => unknown) =>
      Promise.resolve(result).then(onfulfilled),
    )
    return builder
  }

  return {
    mockClient: {
      from: vi.fn((table: string) => {
        void table
        return createDefaultBuilder()
      }),
    },
    mockConstructEvent: vi.fn(),
    mockSendEmail: vi.fn().mockResolvedValue({ id: 'email-1' }),
    mockGenerateCode: vi.fn().mockReturnValue('ABC123'),
  }
})

vi.mock('@/lib/stripe/server', () => ({
  stripe: { webhooks: { constructEvent: mockConstructEvent } },
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockClient),
}))

vi.mock('@/lib/email/client', () => ({
  resend: { emails: { send: mockSendEmail } },
  EMAIL_FROM: 'test@example.com',
}))

vi.mock('@/lib/booking/generate-code', () => ({
  generateBookingCode: mockGenerateCode,
}))

import { POST } from '@/app/api/webhooks/stripe/route'

const TOUR_ROW = { id: 'tour-1', variant: 'adult', is_active: true }

function checkoutEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'evt_1',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_1',
        payment_status: 'paid',
        payment_intent: 'pi_test_1',
        amount_total: 5980,
        metadata: {
          tourVariant: 'adult',
          participantCount: '2',
          contactEmail: 'gast@example.com',
          teamName: 'Die Lotsen',
          scheduledDate: '2026-08-01',
          totalCents: '5980',
        },
        ...overrides,
      },
    },
  }
}

function webhookRequest(body = '{}') {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    body,
  }) as never
}

/** Wires the tables the happy path touches. */
function wireTables(options: {
  existingBooking?: unknown
  insertError?: { message: string; code?: string } | null
} = {}) {
  const insertBuilder = createMockQueryBuilder({
    data: null,
    error: options.insertError ?? null,
  })

  mockClient.from.mockImplementation((table: string) => {
    if (table === 'tours') {
      return createMockQueryBuilder({ data: TOUR_ROW, error: null })
    }
    if (table === 'bookings') {
      return options.existingBooking !== undefined
        ? createMockQueryBuilder({ data: options.existingBooking, error: null })
        : insertBuilder
    }
    return createMockQueryBuilder({ data: null, error: null })
  })

  return insertBuilder
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGenerateCode.mockReturnValue('ABC123')
  mockSendEmail.mockResolvedValue({ id: 'email-1' })
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
})

describe('POST /api/webhooks/stripe', () => {
  it('should reject a request without a signature header', async () => {
    const response = await POST(
      new Request('http://localhost/api/webhooks/stripe', { method: 'POST', body: '{}' }) as never,
    )
    expect(response.status).toBe(400)
  })

  it('should reject an invalid signature', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('bad signature')
    })

    const response = await POST(webhookRequest())
    expect(response.status).toBe(400)
  })

  it('should create the booking and acknowledge a paid checkout', async () => {
    mockConstructEvent.mockReturnValue(checkoutEvent())
    const insertBuilder = wireTables()

    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
    expect(insertBuilder.insert).toHaveBeenCalledTimes(1)
    const inserted = insertBuilder.insert.mock.calls[0][0] as Record<string, unknown>
    expect(inserted.booking_code).toBe('ABC123')
    expect(inserted.status).toBe('confirmed')
    expect(inserted.payment_intent_id).toBe('pi_test_1')
  })

  it('should answer 500 so Stripe retries when the booking cannot be stored', async () => {
    // Returning 200 here told Stripe the event was handled. The guest had
    // paid, no booking existed, and there was no retry.
    mockConstructEvent.mockReturnValue(checkoutEvent())
    wireTables({ insertError: { message: 'connection reset' } })

    const response = await POST(webhookRequest())

    expect(response.status).toBe(500)
  })

  it('should answer 500 when the tour lookup fails', async () => {
    mockConstructEvent.mockReturnValue(checkoutEvent())
    mockClient.from.mockImplementation(() =>
      createMockQueryBuilder({ data: null, error: { message: 'no tour' } }),
    )

    const response = await POST(webhookRequest())

    expect(response.status).toBe(500)
  })

  it('should not create a second booking when Stripe redelivers the same event', async () => {
    // Stripe guarantees at-least-once delivery. Without this check a retry
    // produced two bookings with two different codes for one payment.
    mockConstructEvent.mockReturnValue(checkoutEvent())
    const existing = { id: 'booking-1', booking_code: 'ABC123' }

    const insertBuilder = createMockQueryBuilder({ data: null, error: null })
    mockClient.from.mockImplementation((table: string) => {
      if (table === 'tours') {
        return createMockQueryBuilder({ data: TOUR_ROW, error: null })
      }
      if (table === 'bookings') {
        return createMockQueryBuilder({ data: existing, error: null })
      }
      return insertBuilder
    })

    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
    expect(insertBuilder.insert).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('should ignore a checkout session that is not paid', async () => {
    // With SEPA, Klarna or Sofort, checkout.session.completed fires before the
    // money arrives. Booking then would hand out a free tour.
    mockConstructEvent.mockReturnValue(checkoutEvent({ payment_status: 'unpaid' }))
    const insertBuilder = wireTables()

    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
    expect(insertBuilder.insert).not.toHaveBeenCalled()
  })

  it('should still acknowledge when only the confirmation email fails', async () => {
    // The booking exists at this point; a failed email must not trigger a
    // retry that would duplicate it.
    mockConstructEvent.mockReturnValue(checkoutEvent())
    wireTables()
    mockSendEmail.mockRejectedValue(new Error('resend down'))

    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
  })

  it('should ignore unrelated event types', async () => {
    mockConstructEvent.mockReturnValue({ id: 'evt_2', type: 'payment_intent.created', data: { object: {} } })

    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
    expect(mockClient.from).not.toHaveBeenCalled()
  })

  it('should not log the booking code or the plain email address', async () => {
    // The booking code is the only credential needed to start a paid tour;
    // PM2 logs are long-lived and widely readable.
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    mockConstructEvent.mockReturnValue(checkoutEvent())
    wireTables()

    await POST(webhookRequest())

    const logged = logSpy.mock.calls.flat().map((entry) => JSON.stringify(entry)).join(' ')
    expect(logged).not.toContain('ABC123')
    expect(logged).not.toContain('gast@example.com')
    logSpy.mockRestore()
  })
})
