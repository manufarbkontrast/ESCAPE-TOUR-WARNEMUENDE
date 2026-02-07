'use client'

import { useState } from 'react'
import type { Puzzle, ValidationResult, AnswerRequest } from '@escape-tour/shared'
import { CountPuzzle } from './puzzles/CountPuzzle'
import { TextInputPuzzle } from './puzzles/TextInputPuzzle'

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

export function PuzzleRenderer({ puzzle, sessionId, language, onComplete }: PuzzleRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [startTime] = useState(() => Date.now())

  const difficultyInfo = difficultyConfig[puzzle.difficulty]
  const difficultyLabel = language === 'de' ? difficultyInfo.label : difficultyInfo.labelEn
  const question = language === 'de' ? puzzle.questionDe : (puzzle.questionEn ?? puzzle.questionDe)
  const instruction = language === 'de' ? puzzle.instructionDe : (puzzle.instructionEn ?? puzzle.instructionDe)

  const handleSubmit = async (answer: string | number | Record<string, unknown>) => {
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

      const result: { readonly data: ValidationResult | null; readonly error: string | null } =
        await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.data) {
        throw new Error(language === 'de' ? 'Ungültige Antwort' : 'Invalid response')
      }

      const validation = result.data

      if (validation.isCorrect) {
        onComplete()
      } else {
        setAttempts((prev) => prev + 1)
        const feedbackMessage = language === 'de' ? validation.feedback.messageDe : validation.feedback.messageEn
        setError(feedbackMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === 'de' ? 'Fehler aufgetreten' : 'Error occurred'))
      setAttempts((prev) => prev + 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderPuzzle = () => {
    switch (puzzle.puzzleType) {
      case 'count':
        return (
          <CountPuzzle
            puzzle={puzzle}
            language={language}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )

      case 'symbol_find':
      case 'text_analysis':
      case 'combination':
        return (
          <TextInputPuzzle
            puzzle={puzzle}
            language={language}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )

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
    <div className="space-y-4">
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

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
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
        </div>
      )}

      {/* Attempt Counter */}
      {attempts > 0 && (
        <div className="text-center text-sm text-sand-400">
          {language === 'de' ? 'Versuche' : 'Attempts'}: {attempts}
        </div>
      )}
    </div>
  )
}
