/**
 * Booking confirmation email template
 * Sent after successful Stripe payment via webhook
 */

interface BookingConfirmationData {
  readonly bookingCode: string
  readonly contactEmail: string
  readonly teamName: string | null
  readonly participantCount: number
  readonly scheduledDate: string
  readonly amountCents: number
  readonly tourVariant: 'family' | 'adult'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatCurrency(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

export function buildBookingConfirmationEmail(data: BookingConfirmationData) {
  const tourName = data.tourVariant === 'family' ? 'Familien-Tour' : 'Erwachsenen-Tour'

  const subject = `Buchungsbestätigung – ${data.bookingCode}`

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Buchungsbestätigung</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#0b1929;color:#d4c9b8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1929;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#111f33;border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.04);">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#f5f0e8;">
                Buchung bestätigt!
              </h1>
              <p style="margin:0;font-size:14px;color:#8a7f72;">
                Euer Abenteuer in Warnemünde kann beginnen.
              </p>
            </td>
          </tr>

          <!-- Booking Code -->
          <tr>
            <td style="padding:32px;text-align:center;">
              <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8a7f72;font-weight:600;">
                Euer Buchungscode
              </p>
              <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:8px;color:#e6921e;font-family:'Courier New',monospace;">
                ${data.bookingCode}
              </p>
              <p style="margin:12px 0 0;font-size:12px;color:#6b6158;">
                Gebt diesen Code auf der Spielseite ein, um zu starten.
              </p>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:0 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.02);border-radius:12px;border:1px solid rgba(255,255,255,0.04);">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#8a7f72;">Tour</td>
                        <td align="right" style="font-size:13px;color:#d4c9b8;font-weight:500;">${tourName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#8a7f72;">Teilnehmer</td>
                        <td align="right" style="font-size:13px;color:#d4c9b8;font-weight:500;">${data.participantCount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#8a7f72;">Datum</td>
                        <td align="right" style="font-size:13px;color:#d4c9b8;font-weight:500;">${formatDate(data.scheduledDate)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${data.teamName ? `
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#8a7f72;">Team</td>
                        <td align="right" style="font-size:13px;color:#d4c9b8;font-weight:500;">${data.teamName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#8a7f72;">Bezahlt</td>
                        <td align="right" style="font-size:13px;color:#e6921e;font-weight:600;">${formatCurrency(data.amountCents)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="https://escape-tour-warnemuende.de/play"
                 style="display:inline-block;padding:14px 32px;background-color:#e6921e;color:#0b1929;font-size:15px;font-weight:600;text-decoration:none;border-radius:999px;">
                Tour starten
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.04);">
              <p style="margin:0;font-size:12px;color:#6b6158;">
                Bei Fragen schreibt uns an info@escape-tour-warnemuende.de
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#4a4440;">
                Escape Tour Warnemünde · Das Vermächtnis des Lotsenkapitäns
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()

  const text = `Buchungsbestätigung – Escape Tour Warnemünde

Euer Buchungscode: ${data.bookingCode}

Tour: ${tourName}
Teilnehmer: ${data.participantCount}
Datum: ${formatDate(data.scheduledDate)}${data.teamName ? `\nTeam: ${data.teamName}` : ''}
Bezahlt: ${formatCurrency(data.amountCents)}

Gebt diesen Code auf https://escape-tour-warnemuende.de/play ein, um zu starten.

Bei Fragen schreibt uns an info@escape-tour-warnemuende.de`

  return { subject, html, text }
}
