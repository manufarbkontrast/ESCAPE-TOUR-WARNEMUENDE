import { describe, it, expect } from 'vitest'
import { buildBookingConfirmationEmail } from '@/lib/email/templates/booking-confirmation'

const BASE_DATA = {
  bookingCode: 'ABC123',
  contactEmail: 'test@example.com',
  teamName: 'Die Piraten',
  participantCount: 4,
  scheduledDate: '2026-04-15',
  amountCents: 11960,
  tourVariant: 'adult' as const,
}

describe('buildBookingConfirmationEmail', () => {
  it('should return subject, html, and text', () => {
    const result = buildBookingConfirmationEmail(BASE_DATA)
    expect(result.subject).toBeDefined()
    expect(result.html).toBeDefined()
    expect(result.text).toBeDefined()
  })

  it('should include booking code in subject', () => {
    const { subject } = buildBookingConfirmationEmail(BASE_DATA)
    expect(subject).toContain('ABC123')
  })

  it('should include booking code in html and text', () => {
    const { html, text } = buildBookingConfirmationEmail(BASE_DATA)
    expect(html).toContain('ABC123')
    expect(text).toContain('ABC123')
  })

  it('should show Erwachsenen-Tour for adult variant', () => {
    const { html, text } = buildBookingConfirmationEmail(BASE_DATA)
    expect(html).toContain('Erwachsenen-Tour')
    expect(text).toContain('Erwachsenen-Tour')
  })

  it('should show Familien-Tour for family variant', () => {
    const { html, text } = buildBookingConfirmationEmail({
      ...BASE_DATA,
      tourVariant: 'family',
    })
    expect(html).toContain('Familien-Tour')
    expect(text).toContain('Familien-Tour')
  })

  it('should include participant count', () => {
    const { html, text } = buildBookingConfirmationEmail(BASE_DATA)
    expect(html).toContain('4')
    expect(text).toContain('4')
  })

  it('should format amount as German currency', () => {
    const { html, text } = buildBookingConfirmationEmail(BASE_DATA)
    expect(html).toContain('119,60')
    expect(text).toContain('119,60')
  })

  it('should include team name when provided', () => {
    const { html, text } = buildBookingConfirmationEmail(BASE_DATA)
    expect(html).toContain('Die Piraten')
    expect(text).toContain('Die Piraten')
  })

  it('should omit team row when team name is null', () => {
    const { text } = buildBookingConfirmationEmail({
      ...BASE_DATA,
      teamName: null,
    })
    expect(text).not.toContain('Team:')
  })

  it('should format date in German locale', () => {
    const { text } = buildBookingConfirmationEmail(BASE_DATA)
    // April 15, 2026 in German
    expect(text).toMatch(/15/)
    expect(text).toMatch(/April/)
    expect(text).toMatch(/2026/)
  })
})
