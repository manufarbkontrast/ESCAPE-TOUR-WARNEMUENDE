'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
    decorativeAlt: 'Maritime Dekoration',
  },
  en: {
    title: 'Start Escape Tour',
    subtitle: 'Enter your booking code to begin the adventure.',
    inputLabel: 'Booking Code',
    helpText: 'You can find the code in your booking confirmation.',
    invalidCode: 'Invalid booking code. Please try again.',
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
    decorativeAlt: 'Maritime decoration',
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

const anchorVariants = {
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
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 px-4">
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md space-y-8"
      >
        {/* Anchor icon */}
        <motion.div
          variants={anchorVariants}
          initial="initial"
          animate="animate"
          className="flex justify-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brass-500/10 shadow-lg">
            <svg
              className="h-10 w-10 text-brass-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2a3 3 0 100 6 3 3 0 000-6zM12 8v13M5 12H2l3.5 9H12M19 12h3l-3.5 9H12"
              />
            </svg>
          </div>
        </motion.div>

        {/* Title */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-sand-50">
            {labels.title}
          </h1>
          <p className="mt-2 text-sand-300">{labels.subtitle}</p>
        </div>

        {/* Code input card */}
        <div className="rounded-xl border border-navy-700/50 bg-navy-800/50 p-8 shadow-2xl backdrop-blur-sm">
          <label className="mb-4 block text-center text-sm font-medium text-sand-200">
            {labels.inputLabel}
          </label>

          <CodeInput
            length={4}
            onComplete={handleCodeComplete}
            isSubmitting={isSubmitting}
            error={error}
            language={language}
          />

          <p className="mt-4 text-center text-xs text-sand-400">
            {labels.helpText}
          </p>
        </div>

        {/* Decorative bottom wave */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-brass-500/30" />
          <svg
            className="h-4 w-4 text-brass-500/40"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-brass-500/30" />
        </div>
      </motion.div>
    </div>
  )
}
