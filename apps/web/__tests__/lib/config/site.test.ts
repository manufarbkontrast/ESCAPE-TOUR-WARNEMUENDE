/**
 * Tests for the central site configuration.
 *
 * Contact details were scattered across the contact page, the imprint and the
 * privacy policy — including a placeholder phone number that had been sitting
 * on /kontakt. One source keeps them from drifting apart again.
 */
import { describe, it, expect } from 'vitest'
import { SITE, telHref, mailHref } from '@/lib/config/site'

describe('SITE', () => {
  it('should carry a real phone number, not a placeholder', () => {
    expect(SITE.phone.display).toBe('0173 4772375')
    expect(SITE.phone.display).not.toMatch(/1234567/)
  })

  it('should expose the meeting point the tour actually starts from', () => {
    expect(SITE.meetingPoint.name).toBe('Shoes Please')
    expect(SITE.meetingPoint.minutesBefore).toBe(20)
  })
})

describe('telHref', () => {
  it('should build an international tel: link without spaces', () => {
    expect(telHref('0173 4772375')).toBe('tel:+491734772375')
  })

  it('should keep a number that is already international', () => {
    expect(telHref('+49 173 4772375')).toBe('tel:+491734772375')
  })

  it('should strip formatting characters', () => {
    expect(telHref('0173 / 477-2375')).toBe('tel:+491734772375')
    expect(telHref('(0173) 4772375')).toBe('tel:+491734772375')
  })

  it('should produce a usable link for the configured number', () => {
    // A tel: href with a space or a leading zero fails to dial on iOS.
    const href = telHref(SITE.phone.display)
    expect(href).toMatch(/^tel:\+\d+$/)
  })
})

describe('mailHref', () => {
  it('should build a mailto link', () => {
    expect(mailHref('info@example.de')).toBe('mailto:info@example.de')
  })

  it('should add an encoded subject when given one', () => {
    expect(mailHref('info@example.de', 'Anfrage Firmenevent')).toBe(
      'mailto:info@example.de?subject=Anfrage%20Firmenevent',
    )
  })
})
