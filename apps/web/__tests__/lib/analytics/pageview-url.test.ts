/**
 * Tests for the pageview URL builder.
 *
 * The booking confirmation page is reached as
 * `/buchen/bestaetigung?session_id=cs_live_…`. That id is enough to read the
 * booking (contact address, team name, booking code) from
 * `/api/booking/status`, so it must never be shipped to analytics.
 */
import { describe, it, expect } from 'vitest'
import { buildPageviewUrl } from '@/lib/analytics/pageview-url'

describe('buildPageviewUrl', () => {
  it('should return the bare path when there is no query string', () => {
    expect(buildPageviewUrl('/preise', new URLSearchParams())).toBe('/preise')
  })

  it('should keep harmless parameters', () => {
    expect(buildPageviewUrl('/buchen', new URLSearchParams('location=warnemuende&variant=adult'))).toBe(
      '/buchen?location=warnemuende&variant=adult',
    )
  })

  it('should drop the Stripe checkout session id', () => {
    const url = buildPageviewUrl(
      '/buchen/bestaetigung',
      new URLSearchParams('session_id=cs_live_a1b2c3&from=email'),
    )

    expect(url).not.toContain('cs_live_a1b2c3')
    expect(url).not.toContain('session_id')
    expect(url).toBe('/buchen/bestaetigung?from=email')
  })

  it('should drop the booking code and the payment intent', () => {
    const url = buildPageviewUrl(
      '/buchen/bestaetigung',
      new URLSearchParams('code=ABC123&payment_intent=pi_live_1&token=t'),
    )

    expect(url).toBe('/buchen/bestaetigung')
  })

  it('should return the bare path when every parameter was sensitive', () => {
    expect(buildPageviewUrl('/buchen/bestaetigung', new URLSearchParams('session_id=cs_1'))).toBe(
      '/buchen/bestaetigung',
    )
  })
})
