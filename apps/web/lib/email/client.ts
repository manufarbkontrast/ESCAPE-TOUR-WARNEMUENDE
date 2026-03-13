/**
 * Server-side Resend email client
 * Only import in API routes / server code
 */

import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
  throw new Error('Missing RESEND_API_KEY environment variable')
}

export const resend = new Resend(resendApiKey)

/** Default sender — must be verified in Resend dashboard */
export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Escape Tour Warnemünde <noreply@escape-tour-warnemuende.de>'

/** Recipient for contact form submissions */
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? 'info@escape-tour-warnemuende.de'
