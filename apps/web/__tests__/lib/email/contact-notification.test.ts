import { describe, it, expect } from 'vitest'
import { buildContactNotificationEmail } from '@/lib/email/templates/contact-notification'

const BASE_DATA = {
  name: 'Max Mustermann',
  email: 'max@example.com',
  subject: 'booking',
  message: 'Ich möchte eine Gruppenbuchung anfragen.',
}

describe('buildContactNotificationEmail', () => {
  it('should return subject, html, and text', () => {
    const result = buildContactNotificationEmail(BASE_DATA)
    expect(result.subject).toBeDefined()
    expect(result.html).toBeDefined()
    expect(result.text).toBeDefined()
  })

  it('should include sender name in subject', () => {
    const { subject } = buildContactNotificationEmail(BASE_DATA)
    expect(subject).toContain('Max Mustermann')
  })

  it('should translate subject key to German label', () => {
    const { subject, html } = buildContactNotificationEmail(BASE_DATA)
    expect(subject).toContain('Buchungsanfrage')
    expect(html).toContain('Buchungsanfrage')
  })

  it('should include sender email as reply-to link', () => {
    const { html } = buildContactNotificationEmail(BASE_DATA)
    // Email in mailto href is URI-encoded, display text is HTML-escaped
    expect(html).toContain('mailto:max%40example.com')
    expect(html).toContain('max@example.com')
  })

  it('should include message body', () => {
    const { html, text } = buildContactNotificationEmail(BASE_DATA)
    expect(html).toContain('Gruppenbuchung anfragen')
    expect(text).toContain('Gruppenbuchung anfragen')
  })

  it('should handle all subject types', () => {
    const subjects = ['booking', 'group', 'feedback', 'partnership', 'other']
    const labels = ['Buchungsanfrage', 'Gruppenanfrage', 'Feedback', 'Kooperationsanfrage', 'Sonstiges']

    subjects.forEach((subj, i) => {
      const { subject } = buildContactNotificationEmail({ ...BASE_DATA, subject: subj })
      expect(subject).toContain(labels[i])
    })
  })

  it('should use raw subject for unknown keys', () => {
    const { subject } = buildContactNotificationEmail({
      ...BASE_DATA,
      subject: 'custom-topic',
    })
    expect(subject).toContain('custom-topic')
  })
})
