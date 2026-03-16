'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { Puzzle, ValidationResult, AnswerRequest } from '@escape-tour/shared'
import { isDemoPuzzle } from '@/lib/demo/helpers'
import { playSuccessSound, playErrorSound } from '@/lib/sounds'
import { CountPuzzle } from './puzzles/CountPuzzle'
import { TextInputPuzzle } from './puzzles/TextInputPuzzle'
import { PhotoSearchPuzzle } from './puzzles/PhotoSearchPuzzle'
import { SymbolFindPuzzle } from './puzzles/SymbolFindPuzzle'
import { CombinationPuzzle } from './puzzles/CombinationPuzzle'
import { ARPuzzle } from './puzzles/ARPuzzle'
import { AudioPuzzle } from './puzzles/AudioPuzzle'
import { LogicPuzzle } from './puzzles/LogicPuzzle'
import { NavigationPuzzle } from './puzzles/NavigationPuzzle'
import { DocumentAnalysisPuzzle } from './puzzles/DocumentAnalysisPuzzle'

interface PuzzleRendererProps {
  readonly puzzle: Puzzle
  readonly sessionId: string
  readonly language: 'de' | 'en'
  readonly onComplete: () => void
}

const difficultyConfig = {
  easy: { label: 'Leicht', labelEn: 'Easy', color: 'text-green-400', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.12)' },
  medium: { label: 'Mittel', labelEn: 'Medium', color: 'text-yellow-400', bg: 'rgba(250, 204, 21, 0.08)', border: 'rgba(250, 204, 21, 0.12)' },
  hard: { label: 'Schwer', labelEn: 'Hard', color: 'text-red-400', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.12)' },
  finale: { label: 'Finale', labelEn: 'Finale', color: 'text-white', bg: 'rgba(255, 255, 255, 0.04)', border: 'rgba(255, 255, 255, 0.06)' },
} as const

/**
 * Mini celebration particles shown on correct answer.
 */
function MiniCelebration() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: -(Math.random() * 150 + 50),
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
    color: ['#d6d3d1', '#22c55e', '#3b82f6', '#e7e5e4', '#a855f7'][i % 5],
  }))

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: p.scale,
            opacity: 0,
            rotate: p.rotation,
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

export function PuzzleRenderer({ puzzle, sessionId, language, onComplete }: PuzzleRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [startTime] = useState(() => Date.now())
  const [showSuccess, setShowSuccess] = useState(false)
  const [successPoints, setSuccessPoints] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const difficultyInfo = difficultyConfig[puzzle.difficulty]
  const difficultyLabel = language === 'de' ? difficultyInfo.label : difficultyInfo.labelEn
  const question = language === 'de' ? puzzle.questionDe : (puzzle.questionEn ?? puzzle.questionDe)
  const instruction = language === 'de' ? puzzle.instructionDe : (puzzle.instructionEn ?? puzzle.instructionDe)

  // Auto-complete after success animation
  useEffect(() => {
    if (!showSuccess) return
    const timer = setTimeout(() => {
      onCompleteRef.current()
    }, 1200)
    return () => clearTimeout(timer)
  }, [showSuccess])

  const handleSubmit = useCallback(async (answer: string | number | Record<string, unknown>) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000)

    const requestData: AnswerRequest = {
      sessionId,
      puzzleId: puzzle.id,
      answer,
      timeSpentSeconds,
    }

    try {
      const response = await fetch('/api/game/validate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(language === 'de' ? 'Netzwerkfehler' : 'Network error')
      }

      let result: { readonly data: ValidationResult | null; readonly error: string | null }
      try {
        result = await response.json()
      } catch {
        throw new Error(language === 'de' ? 'Ungültige Serverantwort' : 'Invalid server response')
      }

      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.data) {
        throw new Error(language === 'de' ? 'Ungültige Antwort' : 'Invalid response')
      }

      const validation = result.data

      if (validation.isCorrect) {
        playSuccessSound()
        setSuccessPoints(validation.pointsEarned + validation.timeBonusEarned)
        setShowSuccess(true)
      } else {
        playErrorSound()
        setAttempts((prev) => prev + 1)
        setErrorKey((prev) => prev + 1)
        const feedbackMessage = language === 'de' ? validation.feedback.messageDe : validation.feedback.messageEn
        setError(feedbackMessage)
      }
    } catch (err) {
      playErrorSound()
      setError(err instanceof Error ? err.message : (language === 'de' ? 'Fehler aufgetreten' : 'Error occurred'))
      setAttempts((prev) => prev + 1)
      setErrorKey((prev) => prev + 1)
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, startTime, sessionId, puzzle.id, language])

  const puzzleProps = { puzzle, language, onSubmit: handleSubmit, isSubmitting }

  const renderPuzzle = () => {
    switch (puzzle.puzzleType) {
      case 'count':
        return <CountPuzzle {...puzzleProps} />

      case 'photo_search':
        return <PhotoSearchPuzzle {...puzzleProps} />

      case 'symbol_find':
        return <SymbolFindPuzzle {...puzzleProps} />

      case 'combination':
        return <CombinationPuzzle {...puzzleProps} />

      case 'ar_puzzle':
        return <ARPuzzle {...puzzleProps} />

      case 'audio':
        return <AudioPuzzle {...puzzleProps} />

      case 'logic':
        return <LogicPuzzle {...puzzleProps} />

      case 'navigation':
        return <NavigationPuzzle {...puzzleProps} isDemo={isDemoPuzzle(puzzle.id)} />

      case 'document_analysis':
        return <DocumentAnalysisPuzzle {...puzzleProps} />

      case 'text_analysis':
        return <TextInputPuzzle {...puzzleProps} />

      default:
        return (
          <div className="card p-8 text-center" style={{ borderStyle: 'dashed' }}>
            <p className="text-sm text-dark-300">
              {language === 'de' ? 'Rätseltyp wird noch entwickelt' : 'Puzzle type in development'}
            </p>
            <p className="mt-1 text-xs text-dark-600 font-mono">{puzzle.puzzleType}</p>
          </div>
        )
    }
  }

  return (
    <div className="relative space-y-4">
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key="success-overlay"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(34, 197, 94, 0.08)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(34, 197, 94, 0.1)',
            }}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              >
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-400" strokeWidth={1.5} />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-3 text-xl font-display font-bold text-green-400"
              >
                {language === 'de' ? 'Richtig!' : 'Correct!'}
              </motion.p>
              {successPoints > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-1 text-base font-semibold text-white"
                >
                  +{successPoints} {language === 'de' ? 'Punkte' : 'Points'}
                </motion.p>
              )}
            </div>
            <MiniCelebration />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Difficulty and Points */}
      <div className="flex items-center justify-between">
        <div
          className={`rounded-full px-3.5 py-1 text-xs font-semibold ${difficultyInfo.color}`}
          style={{ background: difficultyInfo.bg, border: `1px solid ${difficultyInfo.border}` }}
        >
          {difficultyLabel}
        </div>
        <div className="flex items-center gap-1.5 text-white">
          <Star className="h-4 w-4" strokeWidth={1.5} fill="currentColor" />
          <span className="font-semibold text-sm tabular-nums">{puzzle.basePoints}</span>
        </div>
      </div>

      {/* Question and Instructions */}
      <div className="card p-6">
        <h3 className="mb-2 text-xl font-display font-bold text-white tracking-tight">{question}</h3>
        {instruction && (
          <p className="mt-2 text-sm text-dark-300 italic leading-relaxed">{instruction}</p>
        )}
      </div>

      {/* Puzzle Image if available */}
      {puzzle.imageUrl && (
        <div className="overflow-hidden rounded-2xl">
          <img
            src={puzzle.imageUrl}
            alt={question}
            className="w-full object-cover"
          />
        </div>
      )}

      {/* Puzzle Input */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(10, 10, 10, 0.3)' }}>
        {renderPuzzle()}
      </div>

      {/* Error Display with Shake Animation */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key={`error-${errorKey}`}
            initial={{ x: 0 }}
            animate={{ x: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.12)',
            }}
          >
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400/80" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-sm text-red-400/90">{error}</p>
                {attempts >= 2 && (
                  <p className="mt-1 text-xs text-red-400/50">
                    {language === 'de' ? 'Benötigen Sie einen Hinweis?' : 'Need a hint?'}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attempt Counter */}
      {attempts > 0 && (
        <div className="text-center text-xs text-dark-600 font-medium">
          {language === 'de' ? 'Versuche' : 'Attempts'}: {attempts}
        </div>
      )}

      {/* Demo Skip Button */}
      {isDemoPuzzle(puzzle.id) && (
        <button
          onClick={onComplete}
          className="btn btn-secondary w-full py-3 text-sm"
          style={{ borderColor: 'rgba(250, 204, 21, 0.2)', color: 'rgba(250, 204, 21, 0.7)' }}
        >
          {language === 'de' ? 'Rätsel überspringen (Demo)' : 'Skip Puzzle (Demo)'}
        </button>
      )}
    </div>
  )
}
