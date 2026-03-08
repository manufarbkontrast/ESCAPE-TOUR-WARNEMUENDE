'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hint } from '@escape-tour/shared'
import { useGameStore } from '@/stores/gameStore'

interface HintSystemProps {
  readonly puzzleId: string
  readonly sessionId: string
  readonly language: 'de' | 'en'
  readonly onClose: () => void
}

const hintLevels = [
  { level: 1, label: 'Kleiner Hinweis', labelEn: 'Small Hint', icon: '💡' },
  { level: 2, label: 'Mittlerer Hinweis', labelEn: 'Medium Hint', icon: '🔍' },
  { level: 3, label: 'Großer Hinweis', labelEn: 'Big Hint', icon: '📍' },
  { level: 4, label: 'Lösung anzeigen', labelEn: 'Show Solution', icon: '🎯' },
] as const

export function HintSystem({ puzzleId, sessionId, language, onClose }: HintSystemProps) {
  const session = useGameStore((state) => state.session)
  const useHint = useGameStore((state) => state.useHint)
  const [hints, setHints] = useState<readonly Hint[]>([])
  const [revealedHints, setRevealedHints] = useState<readonly number[]>([])
  const [confirmingLevel, setConfirmingLevel] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHints = async () => {
      setFetchError(null)
      try {
        const response = await fetch(`/api/game/hints/${puzzleId}`)
        if (!response.ok) throw new Error('Failed to fetch hints')

        const data: { readonly data: readonly Hint[] | null } = await response.json()
        if (data.data) {
          setHints(data.data)
        }
      } catch (error) {
        console.error('Error fetching hints:', error)
        setFetchError(language === 'de' ? 'Hinweise konnten nicht geladen werden' : 'Failed to load hints')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHints()
  }, [puzzleId, language])

  const getElapsedSeconds = () => {
    if (!session?.startedAt) return 0
    const startTime = new Date(session.startedAt).getTime()
    const now = Date.now()
    return Math.floor((now - startTime) / 1000) - session.totalPauseSeconds
  }

  const handleRevealHint = (level: number) => {
    setConfirmingLevel(level)
  }

  const confirmReveal = (level: number) => {
    setRevealedHints((prev) => [...prev, level])
    useHint()
    setConfirmingLevel(null)
  }

  const cancelReveal = () => {
    setConfirmingLevel(null)
  }

  const elapsedSeconds = getElapsedSeconds()

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full max-w-lg rounded-t-2xl bg-navy-900 shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="border-b border-navy-700 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-sand-50">
              {language === 'de' ? 'Hinweise' : 'Hints'}
            </h2>
            <button
              onClick={onClose}
              className="text-sand-400 hover:text-sand-200"
              aria-label={language === 'de' ? 'Schließen' : 'Close'}
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="mb-2 text-2xl">⏳</div>
              <p className="text-sand-300">{language === 'de' ? 'Wird geladen...' : 'Loading...'}</p>
            </div>
          ) : fetchError ? (
            <div className="py-8 text-center">
              <div className="mb-2 text-2xl">⚠️</div>
              <p className="text-red-400">{fetchError}</p>
            </div>
          ) : hints.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sand-300">
                {language === 'de' ? 'Keine Hinweise verfügbar' : 'No hints available'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {hintLevels.map((levelInfo) => {
                const hint = hints.find((h) => h.hintLevel === levelInfo.level)
                if (!hint) return null

                const isAvailable = elapsedSeconds >= hint.availableAfterSeconds
                const isRevealed = revealedHints.includes(levelInfo.level)
                const isConfirming = confirmingLevel === levelInfo.level
                const label = language === 'de' ? levelInfo.label : levelInfo.labelEn
                const hintText = language === 'de' ? hint.textDe : (hint.textEn ?? hint.textDe)

                return (
                  <div
                    key={levelInfo.level}
                    className={`rounded-lg border-2 p-4 transition-all ${
                      isAvailable
                        ? 'border-brass-500/50 bg-navy-800/50'
                        : 'border-navy-700/50 bg-navy-800/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xl">{levelInfo.icon}</span>
                          <h3 className="font-semibold text-sand-50">{label}</h3>
                        </div>

                        {!isAvailable && (
                          <p className="text-xs text-sand-400">
                            {language === 'de' ? 'Verfügbar in' : 'Available in'}{' '}
                            {Math.ceil((hint.availableAfterSeconds - elapsedSeconds) / 60)}{' '}
                            {language === 'de' ? 'Min' : 'min'}
                          </p>
                        )}

                        {isRevealed && (
                          <p className="mt-2 text-sm text-sand-200">{hintText}</p>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="mb-1 text-sm text-brass-400">-{hint.pointPenalty}pts</div>
                        {isAvailable && !isRevealed && !isConfirming && (
                          <button
                            onClick={() => handleRevealHint(levelInfo.level)}
                            className="rounded bg-brass-500 px-3 py-1 text-sm font-medium text-navy-900 transition-all hover:bg-brass-400 active:scale-95"
                          >
                            {language === 'de' ? 'Anzeigen' : 'Reveal'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Confirmation Dialog */}
                    <AnimatePresence>
                      {isConfirming && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 border-t border-navy-700 pt-3"
                        >
                          <p className="mb-3 text-sm text-sand-300">
                            {language === 'de'
                              ? `Dieser Hinweis kostet ${hint.pointPenalty} Punkte. Fortfahren?`
                              : `This hint costs ${hint.pointPenalty} points. Continue?`}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmReveal(levelInfo.level)}
                              className="flex-1 rounded bg-brass-500 px-3 py-2 text-sm font-medium text-navy-900 transition-all hover:bg-brass-400"
                            >
                              {language === 'de' ? 'Ja' : 'Yes'}
                            </button>
                            <button
                              onClick={cancelReveal}
                              className="flex-1 rounded bg-navy-700 px-3 py-2 text-sm font-medium text-sand-200 transition-all hover:bg-navy-600"
                            >
                              {language === 'de' ? 'Nein' : 'No'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
