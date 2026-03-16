'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Anchor } from 'lucide-react'
import { CodeInput } from '@/components/game/CodeInput'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionResponse {
  readonly success: boolean
  readonly data: {
    readonly sessionId: string
  } | null
  readonly error: string | null
}

type PageLanguage = 'de' | 'en'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LABELS = {
  de: {
    title: 'Escape Tour starten',
    subtitle: 'Gebt euren Buchungscode ein, um das Abenteuer zu beginnen.',
    inputLabel: 'Buchungscode',
    helpText: 'Den Code findet ihr in eurer Buchungsbestätigung.',
    invalidCode: 'Ungültiger Buchungscode. Bitte versucht es erneut.',
    networkError: 'Netzwerkfehler. Bitte prüft eure Verbindung.',
    serverError: 'Serverfehler. Bitte versucht es später erneut.',
  },
  en: {
    title: 'Start Escape Tour',
    subtitle: 'Enter your booking code to begin the adventure.',
    inputLabel: 'Booking Code',
    helpText: 'You can find the code in your booking confirmation.',
    invalidCode: 'Invalid booking code. Please try again.',
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
  },
} as const

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
} as const

const iconVariants = {
  initial: { opacity: 0, scale: 0.8, rotate: -10 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 },
  },
} as const

// ---------------------------------------------------------------------------
// PlayEntryPage component
// ---------------------------------------------------------------------------

export default function PlayEntryPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language] = useState<PageLanguage>('de')

  const labels = LABELS[language]

  const handleCodeComplete = useCallback(
    async (code: string) => {
      if (isSubmitting) return

      setIsSubmitting(true)
      setError(null)

      try {
        const response = await fetch('/api/game/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingCode: code }),
        })

        if (!response.ok) {
          if (response.status === 404 || response.status === 400) {
            setError(labels.invalidCode)
            return
          }
          setError(labels.serverError)
          return
        }

        const result: SessionResponse = await response.json()

        if (!result.success || !result.data) {
          setError(result.error ?? labels.invalidCode)
          return
        }

        router.push(`/play/${result.data.sessionId}`)
      } catch {
        setError(labels.networkError)
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, labels, router],
  )

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 px-4">
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md space-y-8"
      >
        {/* Anchor icon */}
        <motion.div
          variants={iconVariants}
          initial="initial"
          animate="animate"
          className="flex justify-center"
        >
          <div
            className="flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 0 40px rgba(255, 255, 255, 0.04)',
            }}
          >
            <Anchor className="h-9 w-9 text-white" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            {labels.title}
          </h1>
          <p className="mt-2 text-dark-300 font-medium text-sm">{labels.subtitle}</p>
        </div>

        {/* Code input card */}
        <div className="card p-8">
          <label className="mb-5 block text-center text-xs font-medium text-dark-300 uppercase tracking-wide">
            {labels.inputLabel}
          </label>

          <CodeInput
            length={6}
            onComplete={handleCodeComplete}
            isSubmitting={isSubmitting}
            error={error}
            language={language}
          />

          <p className="mt-5 text-center text-xs text-dark-600">
            {labels.helpText}
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="h-px w-12" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
          <Anchor className="h-3.5 w-3.5 text-dark-500" strokeWidth={1.5} />
          <div className="h-px w-12" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
        </div>
      </motion.div>
    </div>
  )
}
