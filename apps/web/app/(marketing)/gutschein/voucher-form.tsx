'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Minus, Plus } from 'lucide-react'
import { TOUR_VARIANTS, formatPrice, type TourVariantId } from '@/lib/config/tours'

const MIN_PARTICIPANTS = 1
const MAX_PARTICIPANTS = 20
const MAX_MESSAGE_LENGTH = 500

interface VoucherResponse {
  readonly success: boolean
  readonly data: { readonly url: string | null } | null
  readonly error: string | null
}

export function VoucherForm() {
  const searchParams = useSearchParams()
  const wasCancelled = searchParams.get('cancelled') === 'true'

  const [variantId, setVariantId] = useState<TourVariantId>('adult')
  const [participantCount, setParticipantCount] = useState(2)
  const [purchaserEmail, setPurchaserEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(
    wasCancelled ? 'Zahlung abgebrochen. Ihr könnt es erneut versuchen.' : null,
  )

  const variant = TOUR_VARIANTS.find((v) => v.id === variantId) ?? TOUR_VARIANTS[0]
  // No group discount on vouchers — the buyer is not the group.
  const totalCents = variant.priceCents * participantCount

  const changeCount = useCallback((delta: number) => {
    setParticipantCount((current) =>
      Math.min(MAX_PARTICIPANTS, Math.max(MIN_PARTICIPANTS, current + delta)),
    )
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/checkout/voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourVariant: variantId,
          participantCount,
          purchaserEmail,
          recipientName: recipientName || undefined,
          message: message || undefined,
        }),
      })

      const result: VoucherResponse = await response.json()

      if (!response.ok || !result.success || !result.data?.url) {
        setError(result.error ?? 'Der Gutschein-Kauf konnte nicht gestartet werden.')
        setIsSubmitting(false)
        return
      }

      window.location.href = result.data.url
    } catch {
      setError('Netzwerkfehler. Bitte prüft eure Verbindung.')
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-white placeholder:text-white/30 transition-colors focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/20'

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6 sm:p-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Gutschein zusammenstellen</h2>
        <p className="mt-2 text-sm text-white/60">
          Der Termin wird später gewählt — ihr braucht jetzt keinen.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400/80" strokeWidth={1.5} />
          <p className="text-sm text-white/80">{error}</p>
        </div>
      )}

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-white/60">Tour</legend>
        <div className="space-y-2">
          {TOUR_VARIANTS.map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                option.id === variantId
                  ? 'border-neon-400/50 bg-neon-500/[0.06]'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/25'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="variant"
                  value={option.id}
                  checked={option.id === variantId}
                  onChange={() => setVariantId(option.id)}
                  className="sr-only"
                />
                <span>
                  <span className="block text-base font-bold text-white">{option.name}</span>
                  <span className="block text-sm text-white/50">{option.ageLabel}</span>
                </span>
              </span>
              <span className="font-mono text-sm tabular-nums text-white">
                {formatPrice(option.priceCents)}&nbsp;€
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="voucher-people" className="mb-2 block text-sm font-semibold text-white/60">
          Für wie viele Personen?
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => changeCount(-1)}
            disabled={participantCount <= MIN_PARTICIPANTS}
            aria-label="Personenzahl verringern"
            className="btn-icon h-11 w-11 border border-white/10 text-white disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <output
            id="voucher-people"
            className="min-w-[3ch] text-center font-mono text-2xl tabular-nums text-white"
          >
            {participantCount}
          </output>
          <button
            type="button"
            onClick={() => changeCount(1)}
            disabled={participantCount >= MAX_PARTICIPANTS}
            aria-label="Personenzahl erhöhen"
            className="btn-icon h-11 w-11 border border-white/10 text-white disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="voucher-email" className="mb-2 block text-sm font-semibold text-white/60">
          Eure E-Mail-Adresse
        </label>
        <input
          id="voucher-email"
          type="email"
          required
          maxLength={254}
          value={purchaserEmail}
          onChange={(e) => setPurchaserEmail(e.target.value)}
          placeholder="ihr@beispiel.de"
          className={inputClass}
        />
        <p className="mt-2 text-xs text-white/45">Hierhin schicken wir den Gutschein.</p>
      </div>

      <div>
        <label htmlFor="voucher-recipient" className="mb-2 block text-sm font-semibold text-white/60">
          Für wen? <span className="font-normal text-white/35">(optional)</span>
        </label>
        <input
          id="voucher-recipient"
          type="text"
          maxLength={120}
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Anna und Jonas"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="voucher-message" className="mb-2 block text-sm font-semibold text-white/60">
          Grußwort <span className="font-normal text-white/35">(optional)</span>
        </label>
        <textarea
          id="voucher-message"
          rows={3}
          maxLength={MAX_MESSAGE_LENGTH}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Steht mit auf dem Gutschein."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex items-baseline justify-between border-t border-white/10 pt-5">
        <span className="text-base text-white/60">Gesamt</span>
        <span className="font-display text-3xl text-white">{formatPrice(totalCents)}&nbsp;€</span>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full btn-lg">
        {isSubmitting ? 'Einen Moment…' : 'Gutschein kaufen'}
      </button>

      <p className="text-center text-xs text-white/45">
        Sichere Zahlung über Stripe. Ihr werdet weitergeleitet.
      </p>
    </form>
  )
}
