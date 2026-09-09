'use client'

import { Suspense, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Minus, Plus } from 'lucide-react'
import type { TourVariant } from '@escape-tour/shared'
import {
  TOUR_VARIANTS,
  getTourVariant,
  calculateGroupDiscount,
  formatPrice,
} from '@/lib/config/tours'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BookingStep = 'tour' | 'details' | 'checkout'

interface BookingFormState {
  readonly tourVariant: TourVariant
  readonly participantCount: number
  readonly contactEmail: string
  readonly teamName: string
  readonly scheduledDate: string
}

interface FieldErrors {
  readonly contactEmail?: string
  readonly scheduledDate?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

function getMinDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} as const

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
} as const

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateDetailsStep(form: BookingFormState): FieldErrors {
  const errors: Record<string, string> = {}

  if (!form.contactEmail.trim()) {
    errors.contactEmail = 'Bitte gebt eure E-Mail-Adresse ein'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
    errors.contactEmail = 'Bitte gebt eine gültige E-Mail-Adresse ein'
  }

  if (!form.scheduledDate) {
    errors.scheduledDate = 'Bitte wählt ein Datum aus'
  }

  return errors
}

// ---------------------------------------------------------------------------
// BookingPage
// ---------------------------------------------------------------------------

function BookingForm() {
  const searchParams = useSearchParams()
  const initialVariant = getTourVariant(searchParams.get('variant') ?? '')?.id ?? 'adult'
  const wasCancelled = searchParams.get('cancelled') === 'true'

  const [step, setStep] = useState<BookingStep>('tour')
  const [form, setForm] = useState<BookingFormState>({
    tourVariant: initialVariant,
    participantCount: 2,
    contactEmail: '',
    teamName: '',
    scheduledDate: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(
    wasCancelled ? 'Zahlung abgebrochen. Versucht es erneut.' : null,
  )

  const tourInfo = getTourVariant(form.tourVariant) ?? TOUR_VARIANTS[0]
  const discount = calculateGroupDiscount(form.participantCount)
  const unitPrice = Math.round(tourInfo.priceCents * (1 - discount))
  const totalCents = unitPrice * form.participantCount

  const updateForm = useCallback((updates: Partial<BookingFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }))
    // Clear field error when user starts typing
    const keys = Object.keys(updates) as (keyof FieldErrors)[]
    setFieldErrors((prev) => {
      const next = { ...prev }
      for (const key of keys) {
        delete next[key]
      }
      return next
    })
    setError(null)
  }, [])

  const handleDetailsNext = useCallback(() => {
    const errors = validateDetailsStep(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setError(null)
    setStep('checkout')
  }, [form])

  const handleCheckout = useCallback(async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourVariant: form.tourVariant,
          participantCount: form.participantCount,
          contactEmail: form.contactEmail,
          teamName: form.teamName || undefined,
          scheduledDate: form.scheduledDate,
        }),
      })

      const result = await response.json()

      if (!result.success || !result.data?.url) {
        setError(result.error ?? 'Fehler beim Erstellen der Checkout-Sitzung')
        return
      }

      window.location.href = result.data.url
    } catch {
      setError('Netzwerkfehler. Bitte prüft eure Verbindung.')
    } finally {
      setIsSubmitting(false)
    }
  }, [form])

  // Input styling helpers
  const inputBase =
    'w-full rounded-xl px-4 py-3.5 text-base text-coast-ink placeholder:text-coast-muted focus:outline-none transition-[border-color,box-shadow]'
  const inputNormal = {
    background: '#ffffff',
    border: '1px solid #a8b8b4',
  }
  const inputError = {
    background: '#ffffff',
    border: '1px solid rgba(239, 68, 68, 0.5)',
  }

  return (
    <div className="et-booking min-h-screen">
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container-custom py-12 sm:py-20 pb-24 md:pb-20"
      >
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-coast-ink tracking-tight">
            Tour buchen
          </h1>
          <p className="mt-3 text-coast-muted font-semibold text-base">
            Das Vermächtnis des Lotsenkapitäns — Escape Tour Warnemünde
          </p>
        </div>

        {/* Step indicator */}
        <div className="mx-auto mb-10 flex max-w-xs items-center justify-center gap-2">
          {(['tour', 'details', 'checkout'] as const).map((s, i) => {
            const stepIndex = ['tour', 'details', 'checkout'].indexOf(step)
            const isActive = i <= stepIndex
            const stepLabels = ['Tour', 'Details', 'Bezahlen'] as const
            return (
              <div key={s} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors duration-200"
                    style={{
                      background: isActive ? '#173c43' : '#eaf0e5',
                      color: isActive ? '#f7f5ef' : '#586c6c',
                    }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-coast-muted mt-1">{stepLabels[i]}</span>
                </div>
                {i < 2 && (
                  <div
                    className="h-px w-8 sm:w-12 mb-5"
                    style={{
                      background: i < stepIndex ? '#586c6c' : '#d8ded6',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {step !== 'checkout' && (
          <aside className="et-booking-summary" aria-label="Eure Auswahl" aria-live="polite">
            <div>
              <strong>{tourInfo.name}</strong>
              <p>
                {form.participantCount} Personen · iPad inklusive
                {discount > 0 ? ` · ${Math.round(discount * 100)} % Gruppenrabatt` : ''}
              </p>
            </div>
            <div>
              <span>Gesamtpreis</span>
              <strong>{formatPrice(totalCents)} €</strong>
            </div>
          </aside>
        )}
        {/* Content */}
        <div className={step === 'tour' ? 'mx-auto max-w-6xl' : 'mx-auto max-w-2xl'}>
          {/* Step 1: Tour selection */}
          {step === 'tour' && (
            <motion.div
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <h2 className="font-sans text-2xl font-bold text-coast-ink mb-5">Tour wählen</h2>

              <div className="grid gap-4 md:grid-cols-3">
                {TOUR_VARIANTS.map((info) => {
                  const variant = info.id
                  const isSelected = form.tourVariant === variant

                  return (
                    <button
                      key={variant}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => updateForm({ tourVariant: variant })}
                      className="text-left rounded-2xl p-6 transition-colors duration-200"
                      style={{
                        background: isSelected ? '#eaf0e5' : '#f7f5ef',
                        border: isSelected ? '2px solid #173c43' : '2px solid #d8ded6',
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-sans text-xl font-bold text-coast-ink">
                            {info.name}
                          </h3>
                          <p className="text-sm text-coast-muted mt-0.5">{info.ageLabel}</p>
                        </div>
                        <div
                          className="h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1"
                          style={{
                            borderColor: isSelected ? '#173c43' : '#a8b8b4',
                          }}
                        >
                          {isSelected && <div className="h-3 w-3 rounded-full bg-coast-ink" />}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm text-coast-muted">
                        <span>{info.duration}</span>
                        <span className="text-coast-muted">·</span>
                        <span>{info.distance}</span>
                      </div>

                      <ul className="space-y-1.5 mb-4">
                        {info.features.map((f) => (
                          <li key={f} className="text-sm text-coast-muted flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-coast-muted flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <div className="text-2xl font-sans font-bold text-coast-ink">
                        {formatPrice(info.priceCents)} €
                        <span className="text-sm font-normal text-coast-muted ml-1">/ Person</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              <p className="text-center text-sm text-coast-muted mt-6">
                Ab 6 Personen: 10% Gruppenrabatt — Ab 10 Personen: 15% Rabatt
              </p>

              <button
                onClick={() => setStep('details')}
                className="btn w-full py-4 text-base mt-4 bg-coast-ink text-coast-paper font-semibold hover:bg-dark-100 rounded-lg"
              >
                Weiter
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <motion.div
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <h2 className="font-sans text-2xl font-bold text-coast-ink mb-5">Eure Details</h2>

              <div className="card p-6">
                {/* Participant count */}
                <div className="border-b border-coast-line pb-6 mb-6">
                  <label className="text-sm font-semibold text-coast-muted mb-4 block">
                    Teilnehmer
                  </label>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      aria-label="Teilnehmer verringern"
                      onClick={() =>
                        updateForm({ participantCount: Math.max(1, form.participantCount - 1) })
                      }
                      className="btn-icon-md text-coast-muted"
                      disabled={form.participantCount <= 1}
                    >
                      <Minus className="h-5 w-5" strokeWidth={2} />
                    </button>
                    <span className="font-sans text-4xl font-bold text-coast-ink tabular-nums w-20 text-center">
                      {form.participantCount}
                    </span>
                    <button
                      type="button"
                      aria-label="Teilnehmer erhöhen"
                      onClick={() =>
                        updateForm({ participantCount: Math.min(20, form.participantCount + 1) })
                      }
                      className="btn-icon-md text-coast-muted"
                      disabled={form.participantCount >= 20}
                    >
                      <Plus className="h-5 w-5" strokeWidth={2} />
                    </button>
                  </div>
                  {discount > 0 && (
                    <p className="mt-3 text-center text-sm text-coast-sea font-semibold">
                      {Math.round(discount * 100)}% Gruppenrabatt
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="border-b border-coast-line pb-6 mb-6">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-coast-muted mb-2 block"
                  >
                    E-Mail-Adresse <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => updateForm({ contactEmail: e.target.value })}
                    placeholder="team@beispiel.de"
                    required
                    className={inputBase}
                    style={fieldErrors.contactEmail ? inputError : inputNormal}
                  />
                  {fieldErrors.contactEmail ? (
                    <p className="mt-2 text-sm text-red-700">{fieldErrors.contactEmail}</p>
                  ) : (
                    <p className="mt-2 text-sm text-coast-muted">
                      Euer Buchungscode wird an diese Adresse gesendet
                    </p>
                  )}
                </div>

                {/* Team name (optional) */}
                <div className="border-b border-coast-line pb-6 mb-6">
                  <label
                    htmlFor="team"
                    className="text-sm font-semibold text-coast-muted mb-2 block"
                  >
                    Teamname <span className="text-coast-muted font-normal">(optional)</span>
                  </label>
                  <input
                    id="team"
                    type="text"
                    value={form.teamName}
                    onChange={(e) => updateForm({ teamName: e.target.value })}
                    placeholder="z.B. Die Seeräuber"
                    className={inputBase}
                    style={inputNormal}
                  />
                </div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="date"
                    className="text-sm font-semibold text-coast-muted mb-2 block"
                  >
                    Wunschdatum <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => updateForm({ scheduledDate: e.target.value })}
                    min={getMinDate()}
                    required
                    className={inputBase}
                    style={{
                      ...(fieldErrors.scheduledDate ? inputError : inputNormal),
                      colorScheme: 'light',
                    }}
                  />
                  {fieldErrors.scheduledDate && (
                    <p className="mt-2 text-sm text-red-700">{fieldErrors.scheduledDate}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('tour')} className="btn btn-secondary">
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                  Zurück
                </button>
                <button
                  onClick={handleDetailsNext}
                  className="btn flex-1 py-4 text-base bg-coast-ink text-coast-paper font-semibold hover:bg-dark-100 rounded-lg"
                >
                  Weiter zur Zusammenfassung
                  <ChevronRight className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Summary & Checkout */}
          {step === 'checkout' && (
            <motion.div
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              <h2 className="font-sans text-2xl font-bold text-coast-ink mb-5">Zusammenfassung</h2>

              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base text-coast-muted">Tour</span>
                  <span className="text-base font-semibold text-coast-ink">{tourInfo.name}</span>
                </div>
                <div className="h-px" style={{ background: '#eaf0e5' }} />

                <div className="flex items-center justify-between">
                  <span className="text-base text-coast-muted">Teilnehmer</span>
                  <span className="text-base font-semibold text-coast-ink">
                    {form.participantCount}
                  </span>
                </div>
                <div className="h-px" style={{ background: '#eaf0e5' }} />

                <div className="flex items-center justify-between">
                  <span className="text-base text-coast-muted">E-Mail</span>
                  <span className="text-base font-semibold text-coast-ink">
                    {form.contactEmail}
                  </span>
                </div>
                <div className="h-px" style={{ background: '#eaf0e5' }} />

                {form.teamName && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-coast-muted">Teamname</span>
                      <span className="text-base font-semibold text-coast-ink">
                        {form.teamName}
                      </span>
                    </div>
                    <div className="h-px" style={{ background: '#eaf0e5' }} />
                  </>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-base text-coast-muted">Datum</span>
                  <span className="text-base font-semibold text-coast-ink">
                    {new Date(form.scheduledDate).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="h-px" style={{ background: '#eaf0e5' }} />

                <div className="flex items-center justify-between">
                  <span className="text-base text-coast-muted">Preis pro Person</span>
                  <span className="text-base text-coast-ink">
                    {formatPrice(unitPrice)} €
                    {discount > 0 && (
                      <span className="ml-2 text-sm text-coast-sea font-semibold">
                        (-{Math.round(discount * 100)}%)
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-px" style={{ background: '#eaf0e5' }} />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-semibold text-coast-ink">Gesamt</span>
                  <span className="font-sans text-3xl font-bold text-coast-ink">
                    {formatPrice(totalCents)} €
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <p className="text-base text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('details')}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                  Zurück
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="btn flex-1 py-4 text-base bg-coast-ink text-coast-paper font-semibold hover:bg-dark-100 rounded-lg disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-dark-950 border-t-transparent" />
                      Wird verarbeitet...
                    </>
                  ) : (
                    <>
                      Jetzt bezahlen
                      <ChevronRight className="h-5 w-5" strokeWidth={2} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-coast-muted">
                Sichere Zahlung über Stripe. Ihr werdet weitergeleitet.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Sticky price bar — mobile only, visible on steps 1 and 2 */}
      {step !== 'checkout' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-coast-line bg-coast-paper/95 backdrop-blur px-4 py-3 md:hidden">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div>
              <p className="text-sm text-coast-muted">Gesamt</p>
              <p className="text-lg font-bold text-coast-ink">{formatPrice(totalCents)} €</p>
            </div>
            <button
              onClick={() => (step === 'tour' ? setStep('details') : handleDetailsNext())}
              className="btn btn-primary btn-sm"
            >
              Weiter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Eigene Suspense-Grenze, weil `BookingForm` `useSearchParams()` ruft.
 *
 * Das Root-Layout fängt das **nicht** mehr ab — seine Grenze liegt seit der
 * SSR-Korrektur eng um Analytics. Ohne die Grenze hier reißt das Aussetzen
 * beim Prerender nach oben durch und der Build bricht.
 * Abgesichert durch `__tests__/app/marketing/suspense-grenzen.test.tsx`.
 */
export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BookingForm />
    </Suspense>
  )
}
