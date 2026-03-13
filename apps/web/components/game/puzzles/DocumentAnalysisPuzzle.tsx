'use client'

import { useState } from 'react'
import type { Puzzle } from '@escape-tour/shared'

interface DocumentAnalysisPuzzleProps {
  readonly puzzle: Puzzle
  readonly language: 'de' | 'en'
  readonly onSubmit: (answer: string) => Promise<void>
  readonly isSubmitting: boolean
}

export function DocumentAnalysisPuzzle({ puzzle, language, onSubmit, isSubmitting }: DocumentAnalysisPuzzleProps) {
  const [answer, setAnswer] = useState('')
  const [isZoomed, setIsZoomed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return
    await onSubmit(answer.trim())
  }

  const instruction = language === 'de' ? puzzle.instructionDe : (puzzle.instructionEn ?? puzzle.instructionDe)
  const placeholder = language === 'de' ? 'Ihre Antwort eingeben...' : 'Enter your answer...'
  const submitLabel = isSubmitting
    ? (language === 'de' ? 'Prüfe...' : 'Checking...')
    : (language === 'de' ? 'Antwort prüfen' : 'Check answer')
  const analyzeHint = language === 'de'
    ? 'Untersuchen Sie das Dokument sorgfältig. Tippen Sie zum Vergrößern.'
    : 'Examine the document carefully. Tap to zoom.'
  const noDocumentMessage = language === 'de'
    ? 'Kein Dokument verfügbar.'
    : 'No document available.'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Instruction */}
      <div className="flex items-start gap-3 rounded-lg bg-navy-800 p-3">
        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-sand-300">
          {instruction ?? analyzeHint}
        </p>
      </div>

      {/* Document Image */}
      {puzzle.imageUrl ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsZoomed((prev) => !prev)}
            className="w-full overflow-hidden rounded-lg border-2 border-white/10 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label={isZoomed
              ? (language === 'de' ? 'Verkleinern' : 'Zoom out')
              : (language === 'de' ? 'Vergrößern' : 'Zoom in')}
          >
            <img
              src={puzzle.imageUrl}
              alt={language === 'de' ? 'Dokument' : 'Document'}
              className={`w-full transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
              draggable={false}
            />
          </button>

          {/* Zoom Indicator */}
          <div className="absolute bottom-2 right-2 rounded-full bg-navy-900/80 p-1.5">
            <svg className="h-4 w-4 text-sand-300" fill="currentColor" viewBox="0 0 20 20">
              {isZoomed ? (
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8zm4 0a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8zm4 0a1 1 0 011-1h1V6a1 1 0 012 0v1h1a1 1 0 110 2H9v1a1 1 0 11-2 0V9H6a1 1 0 01-1-1z" clipRule="evenodd" />
              )}
            </svg>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-sand-400">{noDocumentMessage}</p>
      )}

      {/* Answer Input */}
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={placeholder}
        disabled={isSubmitting}
        className="w-full rounded-lg border-2 border-white/20 bg-navy-900 px-4 py-4 text-lg text-sand-50 placeholder-sand-500 shadow-lg transition-all focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {/* Case Sensitive Hint */}
      {puzzle.caseSensitive && (
        <p className="text-xs italic text-sand-400">
          {language === 'de' ? 'Groß-/Kleinschreibung beachten' : 'Case sensitive'}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !answer.trim()}
        className="w-full rounded-lg bg-white px-6 py-4 font-semibold text-navy-900 shadow-lg transition-all hover:bg-sand-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  )
}
