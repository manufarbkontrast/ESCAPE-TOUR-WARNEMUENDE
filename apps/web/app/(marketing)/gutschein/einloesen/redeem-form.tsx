'use client'

import { useState } from 'react'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { SITE } from '@/lib/config/site'

interface VoucherInfo {
  readonly code: string
  readonly tourName: string
  readonly participantCount: number
  readonly validUntil: string
}

interface RedeemedBooking {
  readonly bookingCode: string
  readonly tourName: string
  readonly scheduledDate: string
  readonly participantCount: number
}

type Step = 'code' | 'date' | 'done'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function tomorrow(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white placeholder:text-white/30 transition-colors focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/20'

export function RedeemForm() {
  const [step, setStep] = useState<Step>('code')
  const [code, setCode] = useState('')
  const [voucher, setVoucher] = useState<VoucherInfo | null>(null)
  const [booking, setBooking] = useState<RedeemedBooking | null>(null)

  const [scheduledDate, setScheduledDate] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [teamName, setTeamName] = useState('')
  const [participantCount, setParticipantCount] = useState(1)

  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lookUpCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsBusy(true)

    try {
      const response = await fetch(
        `/api/vouchers/redeem?code=${encodeURIComponent(code.trim().toUpperCase())}`,
      )
      const result = await response.json()

      if (!response.ok || !result.success || !result.data) {
        setError(result.error ?? 'Gutschein konnte nicht geprüft werden.')
        return
      }

      const info = result.data as VoucherInfo
      setVoucher(info)
      setParticipantCount(info.participantCount)
      setStep('date')
    } catch {
      setError('Netzwerkfehler. Bitte prüft eure Verbindung.')
    } finally {
      setIsBusy(false)
    }
  }

  const redeem = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsBusy(true)

    try {
      const response = await fetch('/api/vouchers/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: voucher?.code,
          scheduledDate,
          participantCount,
          contactEmail,
          teamName: teamName || undefined,
        }),
      })
      const result = await response.json()

      if (!response.ok || !result.success || !result.data) {
        setError(result.error ?? 'Der Gutschein konnte nicht eingelöst werden.')
        return
      }

      setBooking(result.data as RedeemedBooking)
      setStep('done')
    } catch {
      setError('Netzwerkfehler. Bitte prüft eure Verbindung.')
    } finally {
      setIsBusy(false)
    }
  }

  if (step === 'done' && booking) {
    return (
      <div className="card space-y-5 p-6 sm:p-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Termin steht</h2>
          <p className="mt-2 text-base leading-relaxed text-white/65">
            {booking.tourName} für {booking.participantCount}{' '}
            {booking.participantCount === 1 ? 'Person' : 'Personen'} am{' '}
            {formatDate(booking.scheduledDate)}. Die Bestätigung ist unterwegs.
          </p>
        </div>

        <div className="rounded-xl bg-dark-950 px-5 py-6 text-center">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
            Euer Startcode
          </p>
          <p className="mt-2 font-mono text-3xl tracking-[0.15em] text-white">
            {booking.bookingCode}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-white/60">
          Kommt {SITE.meetingPoint.minutesBefore} Minuten vor dem Termin zu{' '}
          {SITE.meetingPoint.name} {SITE.meetingPoint.detail}. Dort bekommt ihr
          das iPad und eine kurze Einweisung.
        </p>
      </div>
    )
  }

  return (
    <div className="card space-y-6 p-6 sm:p-8">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400/80" strokeWidth={1.5} />
          <p className="text-sm text-white/80">{error}</p>
        </div>
      )}

      {step === 'code' && (
        <form onSubmit={lookUpCode} className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-white">Gutschein einlösen</h2>
            <p className="mt-2 text-sm text-white/60">
              Den Code findet ihr in der Gutschein-E-Mail.
            </p>
          </div>

          <div>
            <label htmlFor="voucher-code" className="mb-2 block text-sm font-semibold text-white/60">
              Gutscheincode
            </label>
            <input
              id="voucher-code"
              type="text"
              required
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="GS-XXXX-XXXX"
              className={`${inputClass} font-mono tracking-[0.12em]`}
            />
          </div>

          <button type="submit" disabled={isBusy} className="btn btn-primary w-full">
            {isBusy ? 'Prüfe…' : 'Weiter'}
            {!isBusy && <ChevronRight className="h-4 w-4" />}
          </button>
        </form>
      )}

      {step === 'date' && voucher && (
        <form onSubmit={redeem} className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-white">Termin wählen</h2>
            <p className="mt-2 text-sm text-white/60">
              {voucher.tourName} für bis zu {voucher.participantCount}{' '}
              {voucher.participantCount === 1 ? 'Person' : 'Personen'} — bereits bezahlt.
            </p>
          </div>

          <div>
            <label htmlFor="redeem-date" className="mb-2 block text-sm font-semibold text-white/60">
              Datum
            </label>
            <input
              id="redeem-date"
              type="date"
              required
              min={tomorrow()}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="redeem-people" className="mb-2 block text-sm font-semibold text-white/60">
              Personen
            </label>
            <select
              id="redeem-people"
              value={participantCount}
              onChange={(e) => setParticipantCount(Number(e.target.value))}
              className={inputClass}
            >
              {Array.from({ length: voucher.participantCount }, (_, i) => i + 1).map((count) => (
                <option key={count} value={count} className="bg-dark-900">
                  {count} {count === 1 ? 'Person' : 'Personen'}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-white/45">
              Weniger geht, mehr nicht — dafür meldet euch bitte kurz bei uns.
            </p>
          </div>

          <div>
            <label htmlFor="redeem-email" className="mb-2 block text-sm font-semibold text-white/60">
              E-Mail für die Bestätigung
            </label>
            <input
              id="redeem-email"
              type="email"
              required
              maxLength={254}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="ihr@beispiel.de"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="redeem-team" className="mb-2 block text-sm font-semibold text-white/60">
              Teamname <span className="font-normal text-white/35">(optional)</span>
            </label>
            <input
              id="redeem-team"
              type="text"
              maxLength={60}
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Die Lotsen"
              className={inputClass}
            />
          </div>

          <button type="submit" disabled={isBusy} className="btn btn-primary w-full">
            {isBusy ? 'Einen Moment…' : 'Termin verbindlich buchen'}
          </button>
        </form>
      )}
    </div>
  )
}
