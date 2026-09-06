/**
 * Central site configuration.
 *
 * Contact details used to sit in each page that needed them — which is how a
 * placeholder phone number (+49 381 1234567) survived on /kontakt. Everything
 * that shows a way to reach us reads from here.
 */

/** German country code, used to turn a local number into a tel: link. */
const COUNTRY_CODE = '49'

export const SITE = {
  name: 'Escape Tour',
  email: 'info@escape-tour-warnemuende.de',
  privacyEmail: 'datenschutz@escape-tour-warnemuende.de',
  phone: {
    /** As printed on the page. */
    display: '0173 4772375',
    /** When someone can realistically expect an answer. */
    hours: 'Täglich 9–18 Uhr',
  },
  /** Answer time promised on the contact page. */
  responseTime: 'Wir antworten in der Regel innerhalb von 24 Stunden.',
  meetingPoint: {
    name: 'Shoes Please',
    detail: 'am Leuchtturm, Warnemünde',
    /** How early guests should be there — the briefing happens in this window. */
    minutesBefore: 20,
  },
} as const

/**
 * Builds a dialable `tel:` href.
 *
 * iOS refuses to dial a href containing spaces, and a leading zero breaks
 * the call from abroad — so the number is normalised to +49… form.
 */
export function telHref(phone: string): string {
  const digitsOnly = phone.replace(/[^\d+]/g, '')

  if (digitsOnly.startsWith('+')) {
    return `tel:${digitsOnly}`
  }

  const withoutLeadingZero = digitsOnly.replace(/^0/, '')
  return `tel:+${COUNTRY_CODE}${withoutLeadingZero}`
}

/** Builds a `mailto:` href, optionally with a pre-filled subject. */
export function mailHref(email: string, subject?: string): string {
  if (!subject) {
    return `mailto:${email}`
  }
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`
}
