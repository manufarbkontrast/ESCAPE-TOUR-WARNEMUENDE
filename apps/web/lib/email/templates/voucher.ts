/**
 * Gift voucher email.
 *
 * Goes to the purchaser, not the recipient — the buyer decides when and how to
 * hand it over. It therefore has to work when printed or forwarded, which is
 * why the code sits in its own block and the redemption steps are spelled out.
 */

import { getTourVariant, formatPrice } from '@/lib/config/tours'
import { SITE } from '@/lib/config/site'

interface VoucherEmailData {
  readonly code: string
  readonly tourVariant: string
  readonly participantCount: number
  readonly recipientName: string | null
  readonly giftMessage: string | null
  readonly validUntil: string
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** The recipient name and message come from a form — never interpolate raw. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildVoucherEmail(data: VoucherEmailData): {
  readonly subject: string
  readonly html: string
  readonly text: string
} {
  const variant = getTourVariant(data.tourVariant)
  const variantName = variant?.name ?? 'Escape Tour'
  const people =
    data.participantCount === 1 ? '1 Person' : `${data.participantCount} Personen`
  const validUntil = formatDate(data.validUntil)
  const priceNote = variant
    ? `Gegenwert ${formatPrice(variant.priceCents * data.participantCount)} €`
    : ''

  const subject = `Euer Gutschein für die ${variantName} in Warnemünde`

  const greeting = data.recipientName
    ? `Für ${data.recipientName}`
    : 'Ein Gutschein für die Escape Tour Warnemünde'

  const steps = [
    `Auf myescapetour.com/buchen den Gutscheincode eingeben.`,
    `Datum und Uhrzeit wählen — die Tour ist bereits bezahlt.`,
    `${SITE.meetingPoint.minutesBefore} Minuten vor dem Termin zu ${SITE.meetingPoint.name} ${SITE.meetingPoint.detail} kommen.`,
  ]

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e4;">
    <div style="padding:32px 32px 24px;">
      <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#78716c;">Geschenkgutschein</p>
      <h1 style="margin:0;font-size:26px;line-height:1.2;">${escapeHtml(greeting)}</h1>
      <p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:#44403c;">
        ${escapeHtml(variantName)} für ${escapeHtml(people)} — eine Rätseltour mit zwölf
        Stationen durch Warnemünde, vom Leuchtturm bis zum Alten Strom. Das iPad
        bekommt ihr von uns.
      </p>
    </div>

    <div style="margin:0 32px;padding:24px;background:#0a0a0a;border-radius:10px;text-align:center;">
      <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Gutscheincode</p>
      <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:28px;letter-spacing:0.08em;color:#ffffff;">${escapeHtml(data.code)}</p>
      <p style="margin:12px 0 0;font-size:13px;color:rgba(255,255,255,0.55);">Einlösbar bis ${escapeHtml(validUntil)}${priceNote ? ` · ${escapeHtml(priceNote)}` : ''}</p>
    </div>

    ${
      data.giftMessage
        ? `<div style="margin:24px 32px 0;padding:16px 20px;border-left:3px solid #e7e5e4;">
      <p style="margin:0;font-size:15px;line-height:1.6;font-style:italic;color:#44403c;">${escapeHtml(data.giftMessage)}</p>
    </div>`
        : ''
    }

    <div style="padding:28px 32px 8px;">
      <h2 style="margin:0 0 12px;font-size:16px;">So wird er eingelöst</h2>
      <ol style="margin:0;padding-left:20px;font-size:15px;line-height:1.7;color:#44403c;">
        ${steps.map((step) => `<li style="margin-bottom:6px;">${escapeHtml(step)}</li>`).join('')}
      </ol>
    </div>

    <div style="padding:24px 32px 32px;border-top:1px solid #e7e5e4;margin-top:24px;">
      <p style="margin:0;font-size:14px;line-height:1.6;color:#78716c;">
        Fragen? ${escapeHtml(SITE.phone.display)} (${escapeHtml(SITE.phone.hours)})
        oder ${escapeHtml(SITE.email)}.
      </p>
    </div>
  </div>
</body>
</html>`

  const text = [
    greeting,
    '',
    `${variantName} für ${people}`,
    `Gutscheincode: ${data.code}`,
    `Einlösbar bis ${validUntil}${priceNote ? ` (${priceNote})` : ''}`,
    ...(data.giftMessage ? ['', `"${data.giftMessage}"`] : []),
    '',
    'So wird er eingelöst:',
    ...steps.map((step, index) => `${index + 1}. ${step}`),
    '',
    `Fragen? ${SITE.phone.display} (${SITE.phone.hours}) oder ${SITE.email}`,
  ].join('\n')

  return { subject, html, text }
}
