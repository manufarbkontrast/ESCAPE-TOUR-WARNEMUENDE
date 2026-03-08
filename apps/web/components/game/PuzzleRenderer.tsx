'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  easy: { label: 'Leicht', labelEn: 'Easy', color: 'text-green-400', bg: 'bg-green-400/10' },
  medium: { label: 'Mittel', labelEn: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  hard: { label: 'Schwer', labelEn: 'Hard', color: 'text-red-400', bg: 'bg-red-400/10' },
  finale: { label: 'Finale', labelEn: 'Finale', color: 'text-brass-400', bg: 'bg-brass-400/10' },
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
    color: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'][i % 5],
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
          <div className="rounded-lg border-2 border-dashed border-navy-600 bg-navy-800/30 p-8 text-center">
            <p className="text-sand-300">
              {language === 'de' ? 'Rätseltyp wird noch entwickelt' : 'Puzzle type in development'}
            </p>
            <p className="mt-2 text-sm text-sand-400">{puzzle.puzzleType}</p>
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
            className="absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-green-500/20 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              >
                <svg className="mx-auto h-20 w-20 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-3 text-2xl font-display font-bold text-green-400"
              >
                {language === 'de' ? 'Richtig!' : 'Correct!'}
              </motion.p>
              {successPoints > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-1 text-lg font-semibold text-brass-400"
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
        <div className={`rounded-full px-3 py-1 text-sm font-medium ${difficultyInfo.bg} ${difficultyInfo.color}`}>
          {difficultyLabel}
        </div>
        <div className="flex items-center gap-2 text-brass-400">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-semibold">{puzzle.basePoints}</span>
        </div>
      </div>

      {/* Question and Instructions */}
      <div className="rounded-lg bg-navy-800/50 p-6 shadow-xl backdrop-blur-sm">
        <h3 className="mb-2 text-xl font-display font-bold text-sand-50">{question}</h3>
        {instruction && (
          <p className="mt-3 text-sm text-sand-300 italic">{instruction}</p>
        )}
      </div>

      {/* Puzzle Image if available */}
      {puzzle.imageUrl && (
        <div className="overflow-hidden rounded-lg">
          <img
            src={puzzle.imageUrl}
            alt={question}
            className="w-full object-cover"
          />
        </div>
      )}

      {/* Puzzle Input */}
      <div className="rounded-lg bg-navy-800/30 p-6">
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
            className="rounded-lg border border-red-500/50 bg-red-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">{error}</p>
                {attempts >= 2 && (
                  <p className="mt-1 text-xs text-red-300">
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
        <div className="text-center text-sm text-sand-400">
          {language === 'de' ? 'Versuche' : 'Attempts'}: {attempts}
        </div>
      )}

      {/* Demo Skip Button */}
      {isDemoPuzzle(puzzle.id) && (
        <button
          onClick={onComplete}
          className="w-full rounded-lg border-2 border-yellow-500/50 bg-yellow-500/10 px-6 py-3 text-sm font-medium text-yellow-400 transition-all hover:bg-yellow-500/20 active:scale-95"
        >
          {language === 'de' ? 'Rätsel überspringen (Demo)' : 'Skip Puzzle (Demo)'}
        </button>
      )}
    </div>
  )
}
