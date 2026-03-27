/**
 * Contact form notification email template
 * Sent to the business when someone submits the contact form
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface ContactNotificationData {
  readonly name: string
  readonly email: string
  readonly subject: string
  readonly message: string
}

const SUBJECT_LABELS: Record<string, string> = {
  booking: 'Buchungsanfrage',
  group: 'Gruppenanfrage',
  feedback: 'Feedback',
  partnership: 'Kooperationsanfrage',
  other: 'Sonstiges',
}

export function buildContactNotificationEmail(data: ContactNotificationData) {
  const subjectLabel = SUBJECT_LABELS[data.subject] ?? data.subject

  const subject = `Kontaktanfrage: ${subjectLabel} – ${data.name}`

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kontaktanfrage</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#0b1929;color:#d4c9b8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1929;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#111f33;border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">

          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.04);">
              <h1 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#f5f0e8;">
                Neue Kontaktanfrage
              </h1>
              <p style="margin:0;font-size:13px;color:#d4c9b8;font-weight:500;">
                ${escapeHtml(subjectLabel)}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#8a7f72;width:80px;vertical-align:top;">Name</td>
                  <td style="padding:8px 0;font-size:13px;color:#d4c9b8;font-weight:500;">${escapeHtml(data.name)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#8a7f72;vertical-align:top;">E-Mail</td>
                  <td style="padding:8px 0;font-size:13px;">
                    <a href="mailto:${encodeURIComponent(data.email)}" style="color:#d4c9b8;text-decoration:none;">${escapeHtml(data.email)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px;">
              <div style="background-color:rgba(255,255,255,0.02);border-radius:12px;border:1px solid rgba(255,255,255,0.04);padding:20px;">
                <p style="margin:0;font-size:14px;color:#d4c9b8;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="mailto:${encodeURIComponent(data.email)}?subject=Re: ${encodeURIComponent(subjectLabel)}"
                 style="display:inline-block;padding:12px 28px;background-color:#f5f0e8;color:#0b1929;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                Antworten
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()

  const text = `Neue Kontaktanfrage – ${subjectLabel}

Von: ${data.name} (${data.email})

Nachricht:
${data.message}`

  return { subject, html, text }
}
