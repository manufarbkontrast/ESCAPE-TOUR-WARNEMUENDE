/**
 * Tests for the occasion landing pages.
 *
 * These pages exist to be found: someone searching "Firmenevent Rostock" or
 * "Junggesellenabschied Warnemünde" currently lands nowhere. That only works
 * if every entry carries the metadata a search result needs and points at a
 * tour variant that actually exists.
 */
import { describe, it, expect } from 'vitest'
import { OCCASIONS, getOccasion, getEnquiryPrefill } from '@/lib/config/occasions'
import { TOUR_VARIANTS } from '@/lib/config/tours'

describe('OCCASIONS', () => {
  it('should cover the four groups that book as a group', () => {
    expect(OCCASIONS.map((o) => o.slug)).toEqual([
      'firmenevent',
      'kreuzfahrt-gaeste',
      'junggesellenabschied',
      'schulklassen',
    ])
  })

  it('should use url-safe slugs without umlauts', () => {
    for (const occasion of OCCASIONS) {
      expect(occasion.slug).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('should have unique slugs', () => {
    const slugs = OCCASIONS.map((o) => o.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('should recommend a variant that exists', () => {
    // A dead variant id would render a page recommending a tour nobody can book.
    const known = new Set(TOUR_VARIANTS.map((v) => v.id))
    for (const occasion of OCCASIONS) {
      expect(known.has(occasion.recommendedVariant)).toBe(true)
    }
  })

  it('should carry a meta description in the length search engines show', () => {
    for (const occasion of OCCASIONS) {
      expect(occasion.metaDescription.length).toBeGreaterThanOrEqual(70)
      expect(occasion.metaDescription.length).toBeLessThanOrEqual(165)
    }
  })

  it('should name the place in every page title', () => {
    // These pages compete on local searches; a title without the town is wasted.
    for (const occasion of OCCASIONS) {
      expect(occasion.metaTitle).toMatch(/Warnemünde|Rostock/)
    }
  })

  it('should give each occasion three concrete reasons', () => {
    for (const occasion of OCCASIONS) {
      expect(occasion.reasons).toHaveLength(3)
      for (const reason of occasion.reasons) {
        expect(reason.title.length).toBeGreaterThan(0)
        expect(reason.text.length).toBeGreaterThan(40)
      }
    }
  })

  it('should not reuse the same headline twice', () => {
    // Four near-identical pages would compete with each other in search.
    const headlines = OCCASIONS.map((o) => o.headline)
    expect(new Set(headlines).size).toBe(headlines.length)
  })
})

describe('getOccasion', () => {
  it('should find an occasion by slug', () => {
    expect(getOccasion('firmenevent')?.slug).toBe('firmenevent')
  })

  it('should return null for an unknown slug', () => {
    expect(getOccasion('gibtsnicht')).toBeNull()
  })
})

describe('getEnquiryPrefill', () => {
  it('should select the group subject so the mail is routed right', () => {
    // "group" is an existing subject the contact API and the notification
    // template already understand — no second form needed.
    expect(getEnquiryPrefill('firmenevent')?.subject).toBe('group')
  })

  it('should name the occasion in the message', () => {
    const prefill = getEnquiryPrefill('junggesellenabschied')
    expect(prefill?.message).toMatch(/Junggesellenabschied/i)
  })

  it('should leave blanks for what we actually need to know', () => {
    // Group enquiries without a headcount and a date cost one round-trip each.
    const prefill = getEnquiryPrefill('schulklassen')
    expect(prefill?.message).toMatch(/Personen/i)
    expect(prefill?.message).toMatch(/Wunschtermin/i)
  })

  it('should return null for an unknown occasion', () => {
    expect(getEnquiryPrefill('gibtsnicht')).toBeNull()
  })

  it('should return null when no occasion was given', () => {
    expect(getEnquiryPrefill(null)).toBeNull()
  })
})
