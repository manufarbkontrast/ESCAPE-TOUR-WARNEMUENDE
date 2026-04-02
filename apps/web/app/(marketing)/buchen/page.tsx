'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Minus, Plus } from 'lucide-react'
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

interface FieldErrors {
 readonly contactEmail?: string
 readonly scheduledDate?: string
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
 pro: {
  name: 'Profi-Tour',
  subtitle: 'Ab 16 Jahren',
  priceCents: 3490,
  duration: '4–5 Stunden',
  distance: '5 km',
  features: ['Keine Hinweise in Fragen', 'Caesar-Chiffren', 'Mehrstufige Berechnungen'],
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
 const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [error, setError] = useState<string | null>(wasCancelled ? 'Zahlung abgebrochen. Versucht es erneut.' : null)

 const tourInfo = TOUR_INFO[form.tourVariant]
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
  'w-full rounded-xl px-4 py-3.5 text-base text-white placeholder:text-white/30 focus:outline-none transition-all'
 const inputNormal = {
  background: 'rgba(10, 10, 10, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
 }
 const inputError = {
  background: 'rgba(10, 10, 10, 0.6)',
  border: '1px solid rgba(239, 68, 68, 0.5)',
 }

 return (
  <div className="min-h-screen ">
   <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    className="container-custom py-12 sm:py-20 pb-24 md:pb-20"
   >
    {/* Header */}
    <div className="mx-auto max-w-2xl text-center mb-10">
     <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
      Tour buchen
     </h1>
     <p className="mt-3 text-white/70 font-semibold text-base">
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
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-200"
          style={{
           background: isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.05)',
           color: isActive ? '#0a0a0a' : 'rgba(255, 255, 255, 0.3)',
          }}
         >
          {i + 1}
         </div>
         <span className="text-xs text-white/60 mt-1">{stepLabels[i]}</span>
        </div>
        {i < 2 && (
         <div
          className="h-px w-8 sm:w-12 mb-5"
          style={{
           background: i < stepIndex
            ? 'rgba(255, 255, 255, 0.3)'
            : 'rgba(255, 255, 255, 0.06)',
          }}
         />
        )}
       </div>
      )
     })}
    </div>

    {/* Content */}
    <div className="mx-auto max-w-2xl">
     {/* Step 1: Tour selection */}
     {step === 'tour' && (
      <motion.div variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
       <h2 className="font-sans text-2xl font-bold text-white mb-5">Tour wählen</h2>

       <div className="grid gap-4 sm:grid-cols-2">
        {(['family', 'adult', 'pro'] as const).map((variant) => {
         const info = TOUR_INFO[variant]
         const isSelected = form.tourVariant === variant

         return (
          <button
           key={variant}
           type="button"
           onClick={() => updateForm({ tourVariant: variant })}
           className="text-left rounded-2xl p-6 transition-all duration-200"
           style={{
            background: isSelected
             ? 'rgba(255, 255, 255, 0.04)'
             : 'rgba(10, 10, 10, 0.5)',
            border: isSelected
             ? '2px solid rgba(255, 255, 255, 0.25)'
             : '2px solid rgba(255, 255, 255, 0.04)',
           }}
          >
           <div className="flex items-start justify-between mb-4">
            <div>
             <h3 className="font-sans text-xl font-bold text-white">{info.name}</h3>
             <p className="text-sm text-white/60 mt-0.5">{info.subtitle}</p>
            </div>
            <div
             className="h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1"
             style={{
              borderColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
             }}
            >
             {isSelected && (
              <div className="h-3 w-3 rounded-full bg-white" />
             )}
            </div>
           </div>

           <div className="flex items-center gap-4 mb-4 text-sm text-white/70">
            <span>{info.duration}</span>
            <span className="text-white/40">·</span>
            <span>{info.distance}</span>
           </div>

           <ul className="space-y-1.5 mb-4">
            {info.features.map((f) => (
             <li key={f} className="text-sm text-white/60 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-white/30 flex-shrink-0" />
              {f}
             </li>
            ))}
           </ul>

           <div className="text-2xl font-sans font-bold text-white">
            {formatPrice(info.priceCents)} €
            <span className="text-sm font-normal text-white/60 ml-1">/ Person</span>
           </div>
          </button>
         )
        })}
       </div>

       <p className="text-center text-sm text-white/60 mt-6">
        Ab 6 Personen: 10% Gruppenrabatt — Ab 10 Personen: 15% Rabatt
       </p>

       <button
        onClick={() => setStep('details')}
        className="btn w-full py-4 text-base mt-4 bg-white text-dark-950 font-semibold hover:bg-dark-100 rounded-lg"
       >
        Weiter
        <ChevronRight className="h-5 w-5" strokeWidth={2} />
       </button>
      </motion.div>
     )}

     {/* Step 2: Details */}
     {step === 'details' && (
      <motion.div variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
       <h2 className="font-sans text-2xl font-bold text-white mb-5">Eure Details</h2>

       <div className="card p-6">
        {/* Participant count */}
        <div className="border-b border-white/10 pb-6 mb-6">
         <label className="text-sm font-semibold text-white/80 mb-4 block">
          Teilnehmer
         </label>
         <div className="flex items-center justify-between">
          <button
           type="button"
           onClick={() => updateForm({ participantCount: Math.max(1, form.participantCount - 1) })}
           className="btn-icon-md text-white/60"
           disabled={form.participantCount <= 1}
          >
           <Minus className="h-5 w-5" strokeWidth={2} />
          </button>
          <span className="font-sans text-4xl font-bold text-white tabular-nums w-20 text-center">
           {form.participantCount}
          </span>
          <button
           type="button"
           onClick={() => updateForm({ participantCount: Math.min(20, form.participantCount + 1) })}
           className="btn-icon-md text-white/60"
           disabled={form.participantCount >= 20}
          >
           <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
         </div>
         {discount > 0 && (
          <p className="mt-3 text-center text-sm text-green-400 font-semibold">
           {Math.round(discount * 100)}% Gruppenrabatt
          </p>
         )}
        </div>

        {/* Email */}
        <div className="border-b border-white/10 pb-6 mb-6">
         <label htmlFor="email" className="text-sm font-semibold text-white/80 mb-2 block">
          E-Mail-Adresse <span className="text-red-400">*</span>
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
          <p className="mt-2 text-sm text-red-400">{fieldErrors.contactEmail}</p>
         ) : (
          <p className="mt-2 text-sm text-white/50">Euer Buchungscode wird an diese Adresse gesendet</p>
         )}
        </div>

        {/* Team name (optional) */}
        <div className="border-b border-white/10 pb-6 mb-6">
         <label htmlFor="team" className="text-sm font-semibold text-white/80 mb-2 block">
          Teamname <span className="text-white/40 font-normal">(optional)</span>
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
         <label htmlFor="date" className="text-sm font-semibold text-white/80 mb-2 block">
          Wunschdatum <span className="text-red-400">*</span>
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
           colorScheme: 'dark',
          }}
         />
         {fieldErrors.scheduledDate && (
          <p className="mt-2 text-sm text-red-400">{fieldErrors.scheduledDate}</p>
         )}
        </div>
       </div>

       <div className="flex gap-3 pt-2">
        <button
         onClick={() => setStep('tour')}
         className="btn btn-secondary"
        >
         <ChevronLeft className="h-5 w-5" strokeWidth={2} />
         Zurück
        </button>
        <button
         onClick={handleDetailsNext}
         className="btn flex-1 py-4 text-base bg-white text-dark-950 font-semibold hover:bg-dark-100 rounded-lg"
        >
         Weiter zur Zusammenfassung
         <ChevronRight className="h-5 w-5" strokeWidth={2} />
        </button>
       </div>
      </motion.div>
     )}

     {/* Step 3: Summary & Checkout */}
     {step === 'checkout' && (
      <motion.div variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-5">
       <h2 className="font-sans text-2xl font-bold text-white mb-5">Zusammenfassung</h2>

       <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
         <span className="text-base text-white/60">Tour</span>
         <span className="text-base font-semibold text-white">{tourInfo.name}</span>
        </div>
        <div className="h-px" style={{ background: 'rgba(255, 255, 255, 0.04)' }} />

        <div className="flex items-center justify-between">
         <span className="text-base text-white/60">Teilnehmer</span>
         <span className="text-base font-semibold text-white">{form.participantCount}</span>
        </div>
        <div className="h-px" style={{ background: 'rgba(255, 255, 255, 0.04)' }} />

        <div className="flex items-center justify-between">
         <span className="text-base text-white/60">E-Mail</span>
         <span className="text-base font-semibold text-white">{form.contactEmail}</span>
        </div>
        <div className="h-px" style={{ background: 'rgba(255, 255, 255, 0.04)' }} />

        {form.teamName && (
         <>
          <div className="flex items-center justify-between">
           <span className="text-base text-white/60">Teamname</span>
           <span className="text-base font-semibold text-white">{form.teamName}</span>
          </div>
          <div className="h-px" style={{ background: 'rgba(255, 255, 255, 0.04)' }} />
         </>
        )}

        <div className="flex items-center justify-between">
         <span className="text-base text-white/60">Datum</span>
         <span className="text-base font-semibold text-white">
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
         <span className="text-base text-white/60">Preis pro Person</span>
         <span className="text-base text-white">
          {formatPrice(unitPrice)} €
          {discount > 0 && (
           <span className="ml-2 text-sm text-green-400 font-semibold">(-{Math.round(discount * 100)}%)</span>
          )}
         </span>
        </div>
        <div className="h-px" style={{ background: 'rgba(255, 255, 255, 0.04)' }} />

        <div className="flex items-center justify-between pt-2">
         <span className="text-lg font-semibold text-white">Gesamt</span>
         <span className="font-sans text-3xl font-bold text-white">
          {formatPrice(totalCents)} €
         </span>
        </div>
       </div>

       {/* Error */}
       {error && (
        <div
         className="rounded-2xl p-4 flex items-start gap-3"
         style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
        >
         <p className="text-base text-red-400">{error}</p>
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
         className="btn flex-1 py-4 text-base bg-white text-dark-950 font-semibold hover:bg-dark-100 rounded-lg disabled:opacity-40"
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

       <p className="text-center text-sm text-white/50">
        Sichere Zahlung über Stripe. Ihr werdet weitergeleitet.
       </p>
      </motion.div>
     )}
    </div>
   </motion.div>

   {/* Sticky price bar — mobile only, visible on steps 1 and 2 */}
   {step !== 'checkout' && (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-dark-950/95 backdrop-blur px-4 py-3 md:hidden">
     <div className="flex items-center justify-between max-w-lg mx-auto">
      <div>
       <p className="text-sm text-white/60">Gesamt</p>
       <p className="text-lg font-bold text-white">{formatPrice(totalCents)} €</p>
      </div>
      <button
       onClick={() => step === 'tour' ? setStep('details') : handleDetailsNext()}
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
