'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, Copy, Check, ArrowRight, Anchor, Mail } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookingData {
 readonly bookingCode: string
 readonly contactEmail: string
 readonly teamName: string | null
 readonly participantCount: number
 readonly scheduledDate: string
 readonly amountCents: number
 readonly tourVariant: string
}

type LoadState = 'loading' | 'ready' | 'error' | 'processing'

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const pageVariants = {
 initial: { opacity: 0, y: 20 },
 animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
} as const

const checkVariants = {
 initial: { scale: 0 },
 animate: { scale: 1, transition: { delay: 0.2, type: 'spring', stiffness: 300 } },
} as const

// ---------------------------------------------------------------------------
// ConfirmationPage
// ---------------------------------------------------------------------------

export default function ConfirmationPage() {
 const searchParams = useSearchParams()
 const stripeSessionId = searchParams.get('session_id')

 const [loadState, setLoadState] = useState<LoadState>('loading')
 const [booking, setBooking] = useState<BookingData | null>(null)
 const [copied, setCopied] = useState(false)
 const [retryCount, setRetryCount] = useState(0)

 const fetchBooking = useCallback(async () => {
  if (!stripeSessionId) {
   setLoadState('error')
   return
  }

  try {
   const response = await fetch(`/api/booking/status?session_id=${encodeURIComponent(stripeSessionId)}`)
   const result = await response.json()

   if (response.status === 202) {
    // Webhook hasn't processed yet — retry
    setLoadState('processing')
    if (retryCount < 10) {
     setTimeout(() => setRetryCount((prev) => prev + 1), 2000)
    } else {
     setLoadState('error')
    }
    return
   }

   if (!result.success || !result.data) {
    setLoadState('error')
    return
   }

   setBooking(result.data)
   setLoadState('ready')
  } catch {
   setLoadState('error')
  }
 }, [stripeSessionId, retryCount])

 useEffect(() => {
  fetchBooking()
 }, [fetchBooking])

 const handleCopyCode = useCallback(() => {
  if (!booking) return
  navigator.clipboard.writeText(booking.bookingCode)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
 }, [booking])

 // Loading / processing state
 if (loadState === 'loading' || loadState === 'processing') {
  return (
   <div className="flex min-h-screen items-center justify-center px-4">
    <div className="text-center">
     <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />
     <p className="text-sm text-white/60">
      {loadState === 'processing' ? 'Buchung wird verarbeitet...' : 'Wird geladen...'}
     </p>
    </div>
   </div>
  )
 }

 // Error state
 if (loadState === 'error' || !booking) {
  return (
   <div className="flex min-h-screen items-center justify-center px-4">
    <div className="text-center max-w-sm">
     <Anchor className="mx-auto mb-4 h-8 w-8 text-dark-600" strokeWidth={1.5} />
     <h1 className="font-display text-xl font-bold text-white mb-2">Buchung nicht gefunden</h1>
     <p className="text-sm text-white/60 font-semibold mb-6">
      Die Buchung konnte nicht geladen werden. Falls ihr gerade bezahlt habt, versucht es in einigen Sekunden erneut.
     </p>
     <button
      onClick={() => { setRetryCount(0); setLoadState('loading') }}
      className="btn btn-primary"
     >
      Erneut versuchen
     </button>
    </div>
   </div>
  )
 }

 const tourName = booking.tourVariant === 'family' ? 'Familien-Tour' : 'Erwachsenen-Tour'

 return (
  <div className="min-h-screen ">
   <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    className="container-custom py-12 sm:py-20"
   >
    <div className="mx-auto max-w-md text-center">
     {/* Success icon */}
     <motion.div
      variants={checkVariants}
      initial="initial"
      animate="animate"
      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
      style={{
       background: 'rgba(34, 197, 94, 0.1)',
       border: '1px solid rgba(34, 197, 94, 0.15)',
       boxShadow: '0 0 40px rgba(34, 197, 94, 0.08)',
      }}
     >
      <CheckCircle2 className="h-10 w-10 text-green-400" strokeWidth={1.5} />
     </motion.div>

     <h1 className="font-display text-3xl font-bold text-white tracking-tight mb-2">
      Buchung bestätigt!
     </h1>
     <p className="text-white/60 font-semibold text-sm mb-8">
      Euer Abenteuer in Warnemünde kann beginnen.
     </p>

     {/* Booking code — the hero element */}
     <div
      className="rounded-3xl p-8 mb-6"
      style={{
       background: 'rgba(255, 255, 255, 0.025)',
       border: '1px solid rgba(255, 255, 255, 0.075)',
       boxShadow: '0 0 40px rgba(255, 255, 255, 0.03)',
      }}
     >
      <p className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-3">
       Euer Buchungscode
      </p>
      <div className="flex items-center justify-center gap-3">
       <span className="font-mono text-4xl sm:text-5xl font-bold text-white tracking-[0.2em]">
        {booking.bookingCode}
       </span>
       <button
        onClick={handleCopyCode}
        className="btn-icon-md text-white/60"
        aria-label="Code kopieren"
       >
        {copied ? (
         <Check className="h-4 w-4 text-green-400" strokeWidth={2} />
        ) : (
         <Copy className="h-4 w-4" strokeWidth={1.5} />
        )}
       </button>
      </div>
      <p className="mt-3 text-xs text-dark-600">
       Gebt diesen Code auf der Spielseite ein, um zu starten.
      </p>
     </div>

     {/* Booking details */}
     <div className="card p-5 text-left mb-6 space-y-3">
      <div className="flex justify-between">
       <span className="text-xs text-dark-500">Tour</span>
       <span className="text-xs font-semibold text-white/80">{tourName}</span>
      </div>
      <div className="flex justify-between">
       <span className="text-xs text-dark-500">Teilnehmer</span>
       <span className="text-xs font-semibold text-white/80">{booking.participantCount}</span>
      </div>
      <div className="flex justify-between">
       <span className="text-xs text-dark-500">Datum</span>
       <span className="text-xs font-semibold text-white/80">
        {new Date(booking.scheduledDate).toLocaleDateString('de-DE', {
         weekday: 'long',
         day: 'numeric',
         month: 'long',
        })}
       </span>
      </div>
      {booking.teamName && (
       <div className="flex justify-between">
        <span className="text-xs text-dark-500">Team</span>
        <span className="text-xs font-semibold text-white/80">{booking.teamName}</span>
       </div>
      )}
      <div className="flex justify-between">
       <span className="text-xs text-dark-500">Bezahlt</span>
       <span className="text-xs font-semibold text-white">
        {(booking.amountCents / 100).toFixed(2).replace('.', ',')} €
       </span>
      </div>
     </div>

     {/* Email notice */}
     <div
      className="rounded-2xl p-4 flex items-center gap-3 mb-8 text-left"
      style={{
       background: 'rgba(59, 130, 246, 0.05)',
       border: '1px solid rgba(59, 130, 246, 0.1)',
      }}
     >
      <Mail className="h-4 w-4 text-blue-400/70 flex-shrink-0" strokeWidth={1.5} />
      <p className="text-xs text-white/60">
       Eine Bestätigung wurde an <span className="text-white/80 font-semibold">{booking.contactEmail}</span> gesendet.
      </p>
     </div>

     {/* CTA */}
     <Link href="/play" className="btn btn-primary w-full py-4 text-base">
      Tour starten
      <ArrowRight className="h-4 w-4" strokeWidth={2} />
     </Link>
    </div>
   </motion.div>
  </div>
 )
}
