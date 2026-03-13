'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  Mail,
  Calendar,
  ChevronRight,
  Anchor,
  Clock,
  MapPin,
  Minus,
  Plus,
  AlertCircle,
} from 'lucide-react'
import type { TourVariant } from '@escape-tour/shared'

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOUR_INFO = {
  family: {
    name: 'Familien-Tour',
    subtitle: 'Ab 8 Jahren',
    priceCents: 2490,
    duration: '2–3 Stunden',
    distance: '3 km',
    features: ['Kindgerechte Rätsel', 'Einfache Navigation', 'Spielerisches Lernen'],
  },
  adult: {
    name: 'Erwachsenen-Tour',
    subtitle: 'Ab 14 Jahren',
    priceCents: 2990,
    duration: '3–4 Stunden',
    distance: '5 km',
    features: ['Anspruchsvolle Rätsel', 'Historische Tiefe', 'Komplexe Logik'],
  },
} as const

function calculateGroupDiscount(count: number): number {
  if (count >= 10) return 0.15
  if (count >= 6) return 0.10
  return 0
}

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

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
// BookingPage component
// ---------------------------------------------------------------------------

export default function BookingPage() {
  const searchParams = useSearchParams()
  const initialVariant = (searchParams.get('variant') as TourVariant) ?? 'adult'
  const wasCancelled = searchParams.get('cancelled') === 'true'

  const [step, setStep] = useState<BookingStep>('tour')
  const [form, setForm] = useState<BookingFormState>({
    tourVariant: initialVariant,
    participantCount: 2,
    contactEmail: '',
    teamName: '',
    scheduledDate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(wasCancelled ? 'Zahlung abgebrochen. Versucht es erneut.' : null)

  const tourInfo = TOUR_INFO[form.tourVariant]
  const discount = calculateGroupDiscount(form.participantCount)
  const unitPrice = Math.round(tourInfo.priceCents * (1 - discount))
  const totalCents = unitPrice * form.participantCount

  const updateForm = useCallback((updates: Partial<BookingFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }))
    setError(null)
  }, [])

  const handleCheckout = useCallback(async () => {
    if (!form.contactEmail || !form.scheduledDate) {
      setError('Bitte füllt alle Pflichtfelder aus.')
      return
    }

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

      // Redirect to Stripe Checkout
      window.location.href = result.data.url
    } catch {
      setError('Netzwerkfehler. Bitte prüft eure Verbindung.')
    } finally {
      setIsSubmitting(false)
    }
  }, [form])

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950">
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container-custom py-12 sm:py-20"
      >
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-10">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(230, 146, 30, 0.08)',
              border: '1px solid rgba(230, 146, 30, 0.1)',
            }}
          >
            <Anchor className="h-7 w-7 text-brass-400" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-sand-50 tracking-tight">
            Tour buchen
          </h1>
          <p className="mt-2 text-sand-400 text-sm">
            Das Vermächtnis des Lotsenkapitäns — Escape Tour Warnemünde
          </p>
        </div>

        {/* Step indicator */}
        <div className="mx-auto mb-10 flex max-w-xs items-center justify-center gap-2">
          {(['tour', 'details', 'checkout'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200"
                style={{
                  background: step === s || i < ['tour', 'details', 'checkout'].indexOf(step)
                    ? 'rgba(230, 146, 30, 0.9)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: step === s || i < ['tour', 'details', 'checkout'].indexOf(step)
                    ? '#050d17'
                    : 'rgba(255, 255, 255, 0.3)',
                }}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div className="h-px w-8 sm:w-12" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="mx-auto max-w-2xl">
          {/* Step 1: Tour selection */}
          {step === 'tour' && (
            <motion.div variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
              <h2 className="font-display text-xl font-bold text-sand-50 mb-4 tracking-tight">Tour wählen</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {(['family', 'adult'] as const).map((variant) => {
                  const info = TOUR_INFO[variant]
                  const isSelected = form.tourVariant === variant

                  return (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => updateForm({ tourVariant: variant })}
                      className="card-hover text-left p-5"
                      style={isSelected ? {
                        background: 'rgba(230, 146, 30, 0.06)',
                        borderColor: 'rgba(230, 146, 30, 0.25)',
                        boxShadow: '0 0 20px rgba(230, 146, 30, 0.06)',
                      } : undefined}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-display font-bold text-sand-50 tracking-tight">{info.name}</h3>
                          <p className="text-xs text-sand-500">{info.subtitle}</p>
                        </div>
                        <div
                          className="h-5 w-5 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: isSelected ? '#edaa3b' : 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {isSelected && (
                            <div className="h-2.5 w-2.5 rounded-full bg-brass-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-3 text-xs text-sand-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={1.5} /> {info.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" strokeWidth={1.5} /> {info.distance}
                        </span>
                      </div>

                      <ul className="space-y-1 mb-3">
                        {info.features.map((f) => (
                          <li key={f} className="text-xs text-sand-400 flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-brass-500/50" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <div className="text-lg font-display font-bold text-brass-400">
                        {formatPrice(info.priceCents)} € <span className="text-xs font-normal text-sand-500">/ Person</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setStep('details')}
                className="btn btn-primary w-full py-4 mt-4"
              >
                Weiter
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <motion.div variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
              <h2 className="font-display text-xl font-bold text-sand-50 mb-4 tracking-tight">Eure Details</h2>

              {/* Participant count */}
              <div className="card p-5">
                <label className="text-xs font-medium text-sand-400 uppercase tracking-wide mb-3 block">
                  <Users className="inline h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
                  Teilnehmer
                </label>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => updateForm({ participantCount: Math.max(1, form.participantCount - 1) })}
                    className="btn-icon-md text-sand-300"
                    disabled={form.participantCount <= 1}
                  >
                    <Minus className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <span className="font-display text-3xl font-bold text-sand-50 tabular-nums w-16 text-center">
                    {form.participantCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateForm({ participantCount: Math.min(20, form.participantCount + 1) })}
                    className="btn-icon-md text-sand-300"
                    disabled={form.participantCount >= 20}
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                {discount > 0 && (
                  <p className="mt-2 text-center text-xs text-green-400/80 font-medium">
                    {Math.round(discount * 100)}% Gruppenrabatt
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="card p-5">
                <label htmlFor="email" className="text-xs font-medium text-sand-400 uppercase tracking-wide mb-2 block">
                  <Mail className="inline h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
                  E-Mail *
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => updateForm({ contactEmail: e.target.value })}
                  placeholder="team@beispiel.de"
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm text-sand-100 placeholder:text-sand-600 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(11, 25, 41, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(230, 146, 30, 0.3)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)' }}
                />
                <p className="mt-1.5 text-[11px] text-sand-600">Euer Buchungscode wird an diese Adresse gesendet</p>
              </div>

              {/* Team name (optional) */}
              <div className="card p-5">
                <label htmlFor="team" className="text-xs font-medium text-sand-400 uppercase tracking-wide mb-2 block">
                  <Users className="inline h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
                  Teamname (optional)
                </label>
                <input
                  id="team"
                  type="text"
                  value={form.teamName}
                  onChange={(e) => updateForm({ teamName: e.target.value })}
                  placeholder="z.B. Die Seeräuber"
                  className="w-full rounded-xl px-4 py-3 text-sm text-sand-100 placeholder:text-sand-600 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(11, 25, 41, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(230, 146, 30, 0.3)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)' }}
                />
              </div>

              {/* Date */}
              <div className="card p-5">
                <label htmlFor="date" className="text-xs font-medium text-sand-400 uppercase tracking-wide mb-2 block">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
                  Wunschdatum *
                </label>
                <input
                  id="date"
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => updateForm({ scheduledDate: e.target.value })}
                  min={getMinDate()}
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm text-sand-100 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(11, 25, 41, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    colorScheme: 'dark',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(230, 146, 30, 0.3)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)' }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('tour')}
                  className="btn btn-secondary"
                >
                  Zurück
                </button>
                <button
                  onClick={() => {
                    if (!form.contactEmail || !form.scheduledDate) {
                      setError('Bitte füllt alle Pflichtfelder aus.')
                      return
                    }
                    setError(null)
                    setStep('checkout')
                  }}
                  className="btn btn-primary flex-1 py-4"
                >
                  Weiter zur Zusammenfassung
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Summary & Checkout */}
          {step === 'checkout' && (
            <motion.div variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
              <h2 className="font-display text-xl font-bold text-sand-50 mb-4 tracking-tight">Zusammenfassung</h2>

              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-sand-400">Tour</span>
                  <span className="text-sm font-medium text-sand-100">{tourInfo.name}</span>
                </div>
                <div className="h-px" style={{ background: 'rgba(255, 255, 255, 0.04)' }} />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-sand-400">Teilnehmer</span>
                  <span className="text-sm font-medium text-sand-100">{form.participantCount}</span>
                </div>
                <div className="h-px" style={{ background: 'rgba(255, 255, 255, 0.04)' }} />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-sand-400">E-Mail</span>
                  <span className="text-sm font-medium text-sand-100">{form.contactEmail}</span>
                </div>
                <div className="h-px" style={{ background: 'rgba(255, 255, 255, 0.04)' }} />

                {form.teamName && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-sand-400">Teamname</span>
                      <span className="text-sm font-medium text-sand-100">{form.teamName}</span>
                    </div>
                    <div className="h-px" style={{ background: 'rgba(255, 255, 255, 0.04)' }} />
                  </>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-sand-400">Datum</span>
                  <span className="text-sm font-medium text-sand-100">
                    {new Date(form.scheduledDate).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="h-px" style={{ background: 'rgba(255, 255, 255, 0.04)' }} />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-sand-400">Preis pro Person</span>
                  <span className="text-sm text-sand-100">
                    {formatPrice(unitPrice)} €
                    {discount > 0 && (
                      <span className="ml-1.5 text-xs text-green-400/80">(-{Math.round(discount * 100)}%)</span>
                    )}
                  </span>
                </div>
                <div className="h-px" style={{ background: 'rgba(255, 255, 255, 0.04)' }} />

                <div className="flex items-center justify-between pt-1">
                  <span className="font-medium text-sand-100">Gesamt</span>
                  <span className="font-display text-2xl font-bold text-brass-400">
                    {formatPrice(totalCents)} €
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.12)' }}
                >
                  <AlertCircle className="h-4 w-4 text-red-400/80 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-sm text-red-400/90">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('details')}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Zurück
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 py-4"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy-950 border-t-transparent" />
                      Wird verarbeitet...
                    </>
                  ) : (
                    <>
                      Jetzt bezahlen
                      <ChevronRight className="h-4 w-4" strokeWidth={2} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-[11px] text-sand-600">
                Sichere Zahlung über Stripe. Ihr werdet weitergeleitet.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
