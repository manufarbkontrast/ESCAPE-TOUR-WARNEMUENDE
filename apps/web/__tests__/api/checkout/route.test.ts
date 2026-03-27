/**
 * Tests for POST /api/checkout
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}))

vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  },
}))

vi.mock('@/lib/utils/rate-limit', () => ({
  createRateLimiter: () => ({
    check: () => ({ allowed: true, retryAfterMs: 0 }),
    reset: () => {},
  }),
}))

import { POST } from '@/app/api/checkout/route'

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const VALID_BODY = {
  tourVariant: 'adult',
  participantCount: 3,
  contactEmail: 'test@test.de',
  scheduledDate: '2026-05-01',
}

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
    })
  })

  it('should return 400 if required fields are missing', async () => {
    const response = await POST(createRequest({ tourVariant: 'adult' }))
    expect(response.status).toBe(400)
  })

  it('should return 400 for invalid participant count', async () => {
    const response = await POST(
      createRequest({ ...VALID_BODY, participantCount: 25 }),
    )
    expect(response.status).toBe(400)
  })

  it('should return 400 for invalid email', async () => {
    const response = await POST(
      createRequest({ ...VALID_BODY, contactEmail: 'bad' }),
    )
    expect(response.status).toBe(400)
  })

  it('should return 400 for invalid tour variant', async () => {
    const response = await POST(
      createRequest({ ...VALID_BODY, tourVariant: 'vip' }),
    )
    expect(response.status).toBe(400)
  })

  it('should create a Stripe session with correct unit amount for adult tour', async () => {
    await POST(createRequest(VALID_BODY))
    expect(mockCreate).toHaveBeenCalledOnce()
    const args = mockCreate.mock.calls[0][0]
    // Adult = 2990 cents, 3 participants, no group discount
    expect(args.line_items[0].price_data.unit_amount).toBe(2990)
    expect(args.line_items[0].quantity).toBe(3)
  })

  it('should apply 10% group discount for 6+ participants', async () => {
    await POST(createRequest({ ...VALID_BODY, participantCount: 6 }))
    const args = mockCreate.mock.calls[0][0]
    // 2990 * 0.9 = 2691
    expect(args.line_items[0].price_data.unit_amount).toBe(2691)
  })

  it('should apply 15% group discount for 10+ participants', async () => {
    await POST(createRequest({ ...VALID_BODY, participantCount: 10 }))
    const args = mockCreate.mock.calls[0][0]
    // 2990 * 0.85 = 2542 (rounded)
    expect(args.line_items[0].price_data.unit_amount).toBe(2542)
  })

  it('should use family price for family variant', async () => {
    await POST(createRequest({ ...VALID_BODY, tourVariant: 'family', participantCount: 2 }))
    const args = mockCreate.mock.calls[0][0]
    expect(args.line_items[0].price_data.unit_amount).toBe(2490)
  })

  it('should return session id and url on success', async () => {
    const response = await POST(createRequest(VALID_BODY))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.sessionId).toBe('cs_test_123')
    expect(body.data.url).toBe('https://checkout.stripe.com/test')
  })

  it('should store metadata on the Stripe session', async () => {
    await POST(createRequest({ ...VALID_BODY, teamName: 'Crew' }))
    const args = mockCreate.mock.calls[0][0]
    expect(args.metadata.tourVariant).toBe('adult')
    expect(args.metadata.participantCount).toBe('3')
    expect(args.metadata.contactEmail).toBe('test@test.de')
    expect(args.metadata.teamName).toBe('Crew')
    expect(args.metadata.scheduledDate).toBe('2026-05-01')
  })
})
