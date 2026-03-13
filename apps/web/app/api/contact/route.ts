/**
 * POST /api/contact
 * Handles contact form submissions — sends notification email to business
 */

import type { NextRequest } from 'next/server'
import { resend, EMAIL_FROM, CONTACT_EMAIL } from '@/lib/email/client'
import { buildContactNotificationEmail } from '@/lib/email/templates/contact-notification'
import { successResponse, errorResponse, toNextResponse } from '@/lib/utils/api-response'

interface ContactRequest {
  readonly name: string
  readonly email: string
  readonly subject: string
  readonly message: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactRequest

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return toNextResponse(errorResponse('Bitte füllt alle Felder aus'), 400)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return toNextResponse(errorResponse('Ungültige E-Mail-Adresse'), 400)
    }

    if (body.message.length > 5000) {
      return toNextResponse(errorResponse('Nachricht ist zu lang (max. 5000 Zeichen)'), 400)
    }

    const { subject, html, text } = buildContactNotificationEmail({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
    })

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: CONTACT_EMAIL,
      replyTo: body.email,
      subject,
      html,
      text,
    })

    if (error) {
      console.error('Contact email send error:', error)
      return toNextResponse(errorResponse('Nachricht konnte nicht gesendet werden'), 500)
    }

    return toNextResponse(successResponse({ sent: true }))
  } catch (error) {
    console.error('Contact form error:', error)
    return toNextResponse(
      errorResponse(
        error instanceof Error ? error.message : 'Fehler beim Senden der Nachricht'
      ),
      500,
    )
  }
}
