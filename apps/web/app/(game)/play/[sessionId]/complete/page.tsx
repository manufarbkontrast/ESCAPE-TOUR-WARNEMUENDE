'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Certificate, ApiResponse, BadgeLevel } from '@escape-tour/shared'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LoadingState = 'loading' | 'ready' | 'error'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BADGE_CONFIG: Record<
  BadgeLevel,
  {
    readonly labelDe: string
    readonly labelEn: string
    readonly color: string
    readonly bgGradient: string
    readonly icon: string
  }
> = {
  gold: {
    labelDe: 'Gold',
    labelEn: 'Gold',
    color: 'text-yellow-300',
    bgGradient: 'from-yellow-500/20 to-yellow-600/10',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  silver: {
    labelDe: 'Silber',
    labelEn: 'Silver',
    color: 'text-gray-300',
    bgGradient: 'from-gray-400/20 to-gray-500/10',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  bronze: {
    labelDe: 'Bronze',
    labelEn: 'Bronze',
    color: 'text-amber-600',
    bgGradient: 'from-amber-700/20 to-amber-800/10',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
} as const

const CONFETTI_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 2,
  duration: 2 + Math.random() * 3,
  size: 4 + Math.random() * 8,
  rotation: Math.random() * 360,
  color: ['#ffffff', '#22c55e', '#3b82f6', '#e7e5e4', '#d6d3d1'][
    Math.floor(Math.random() * 5)
  ],
}))

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
} as const

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.3, rotate: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.5,
    },
  },
} as const

// ---------------------------------------------------------------------------
// Confetti sub-component
// ---------------------------------------------------------------------------

function ConfettiEffect() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {CONFETTI_PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: '-10vh',
            rotate: particle.rotation,
            opacity: 1,
          }}
          animate={{
            y: '110vh',
            rotate: particle.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeIn',
            repeat: 0,
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.size > 8 ? '2px' : '50%',
          }}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat card sub-component
// ---------------------------------------------------------------------------

interface StatCardProps {
  readonly labelDe: string
  readonly labelEn: string
  readonly value: string | number
  readonly language: 'de' | 'en'
  readonly icon: React.ReactNode
}

function StatCard({ labelDe, labelEn, value, language, icon }: StatCardProps) {
  return (
    <div className="rounded-lg bg-dark-800/50 p-4 text-center shadow-lg backdrop-blur-sm">
      <div className="mb-2 flex justify-center text-white">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-dark-300">
        {language === 'de' ? labelDe : labelEn}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CompletePage component
// ---------------------------------------------------------------------------

export default function CompletePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [loadingState, setLoadingState] = useState<LoadingState>('loading')
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(true)
  const [language] = useState<'de' | 'en'>('de')

  // Fetch certificate data
  useEffect(() => {
    const fetchCertificate = async () => {
      setLoadingState('loading')

      try {
        const response = await fetch(
          `/api/game/certificate?sessionId=${encodeURIComponent(sessionId)}`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch certificate')
        }

        const result: ApiResponse<Certificate> = await response.json()

        if (!result.success || !result.data) {
          setErrorMessage(
            result.error ?? 'Zertifikat konnte nicht geladen werden.',
          )
          setLoadingState('error')
          return
        }

        setCertificate(result.data)
        setLoadingState('ready')
      } catch {
        setErrorMessage('Netzwerkfehler. Bitte versucht es erneut.')
        setLoadingState('error')
      }
    }

    fetchCertificate()
  }, [sessionId])

  // Hide confetti after animation
  useEffect(() => {
    if (!showConfetti) return

    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 6000)

    return () => clearTimeout(timer)
  }, [showConfetti])

  // Share handler
  const handleShare = useCallback(async () => {
    if (!certificate) return

    const shareData = {
      title:
        language === 'de'
          ? `Escape Tour abgeschlossen!`
          : `Escape Tour Completed!`,
      text:
        language === 'de'
          ? `Team "${certificate.teamName}" hat die ${certificate.tourName} mit ${certificate.stats.totalPoints} Punkten und dem ${BADGE_CONFIG[certificate.badge].labelDe}-Abzeichen abgeschlossen!`
          : `Team "${certificate.teamName}" completed the ${certificate.tourName} with ${certificate.stats.totalPoints} points and earned the ${BADGE_CONFIG[certificate.badge].labelEn} badge!`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled share or share not supported
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`,
        )
      } catch {
        // Clipboard not supported
      }
    }
  }, [certificate, language])

  const badgeConfig = useMemo(
    () => (certificate ? BADGE_CONFIG[certificate.badge] : null),
    [certificate],
  )

  const formattedTime = useMemo(() => {
    if (!certificate) return ''
    const totalMinutes = certificate.stats.totalTimeMinutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes} min`
  }, [certificate])

  // Loading state
  if (loadingState === 'loading') {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-b from-dark-950 to-dark-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
          <p className="text-dark-200 font-medium">
            {language === 'de'
              ? 'Zertifikat wird geladen...'
              : 'Loading certificate...'}
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (loadingState === 'error' || !certificate || !badgeConfig) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-b from-dark-950 to-dark-900 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="mb-6 text-dark-200 font-medium">{errorMessage}</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-white px-6 py-3 font-semibold text-dark-950 shadow-lg transition-all hover:bg-dark-100 active:scale-95"
          >
            {language === 'de' ? 'Zur Startseite' : 'Back to Home'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 px-4 py-8">
      {/* Confetti */}
      {showConfetti && <ConfettiEffect />}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-lg space-y-6"
      >
        {/* Badge and congratulations */}
        <motion.div
          variants={badgeVariants}
          className="text-center"
        >
          <div
            className={`mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${badgeConfig.bgGradient} shadow-2xl`}
          >
            <svg
              className={`h-16 w-16 ${badgeConfig.color}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d={badgeConfig.icon} />
            </svg>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <h1 className="font-display text-3xl font-bold text-white">
            {language === 'de' ? 'Geschafft!' : 'Congratulations!'}
          </h1>
          <p className="mt-2 text-lg text-white">
            {language === 'de'
              ? `${badgeConfig.labelDe}-Abzeichen`
              : `${badgeConfig.labelEn} Badge`}
          </p>
        </motion.div>

        {/* Certificate card */}
        <motion.div
          variants={itemVariants}
          className="overflow-hidden rounded-xl border border-white/10 bg-dark-800/50 shadow-2xl backdrop-blur-sm"
        >
          {/* Certificate header */}
          <div className="border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-white">
              {language === 'de' ? 'Zertifikat' : 'Certificate'}
            </p>
          </div>

          <div className="space-y-4 p-6">
            {/* Team name */}
            <div className="text-center">
              <p className="text-xs text-dark-300">
                {language === 'de' ? 'Teamname' : 'Team Name'}
              </p>
              <p className="font-display text-2xl font-bold text-white">
                {certificate.teamName}
              </p>
            </div>

            {/* Tour info */}
            <div className="text-center">
              <p className="text-xs text-dark-300">
                {language === 'de' ? 'Tour' : 'Tour'}
              </p>
              <p className="text-dark-100">{certificate.tourName}</p>
              <p className="mt-1 text-xs text-dark-300">
                {new Date(certificate.date).toLocaleDateString(
                  language === 'de' ? 'de-DE' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  },
                )}
              </p>
            </div>

            {/* Verification code */}
            <div className="rounded-lg bg-dark-900/50 px-4 py-2 text-center">
              <p className="text-[10px] text-dark-500">
                {language === 'de' ? 'Verifizierungscode' : 'Verification Code'}
              </p>
              <p className="font-mono text-sm tracking-wider text-dark-200">
                {certificate.verificationCode}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-3"
        >
          <StatCard
            labelDe="Punkte"
            labelEn="Points"
            value={certificate.stats.totalPoints}
            language={language}
            icon={
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            }
          />
          <StatCard
            labelDe="Spielzeit"
            labelEn="Play Time"
            value={formattedTime}
            language={language}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            labelDe="Stationen"
            labelEn="Stations"
            value={certificate.stats.stationsCompleted}
            language={language}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            labelDe="Hinweise"
            labelEn="Hints Used"
            value={certificate.stats.hintsUsed}
            language={language}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
        </motion.div>

        {/* Action buttons */}
        <motion.div variants={itemVariants} className="space-y-3 pt-2">
          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-dark-950 shadow-lg transition-all hover:bg-dark-100 active:scale-95"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            {language === 'de' ? 'Ergebnis teilen' : 'Share Result'}
          </button>

          {/* Back to home */}
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-lg border-2 border-dark-700 px-6 py-3 font-medium text-dark-200 transition-all hover:border-white/20 hover:text-dark-100 active:scale-95"
          >
            {language === 'de' ? 'Zur Startseite' : 'Back to Home'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
