'use client'

import { useState } from 'react'
import type { Puzzle } from '@escape-tour/shared'

interface TextInputPuzzleProps {
  readonly puzzle: Puzzle
  readonly language: 'de' | 'en'
  readonly onSubmit: (answer: string) => Promise<void>
  readonly isSubmitting: boolean
}

export function TextInputPuzzle({ puzzle, language, onSubmit, isSubmitting }: TextInputPuzzleProps) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return
    await onSubmit(answer.trim())
  }

  const placeholder = language === 'de' ? 'Ihre Antwort eingeben...' : 'Enter your answer...'
  const submitLabel = isSubmitting
    ? (language === 'de' ? 'Wird überprüft...' : 'Checking...')
    : (language === 'de' ? 'Antwort einreichen' : 'Submit Answer')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Text Input */}
      <div className="relative">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="w-full rounded-lg border-2 border-white/20 bg-navy-900 px-4 py-4 text-lg text-sand-50 placeholder-sand-500 shadow-lg transition-all focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        {answer && !isSubmitting && (
          <button
            type="button"
            onClick={() => setAnswer('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-400 hover:text-sand-200"
            aria-label={language === 'de' ? 'Löschen' : 'Clear'}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Helper Text */}
      {puzzle.caseSensitive && (
        <p className="text-xs text-sand-400 italic">
          {language === 'de' ? 'Groß-/Kleinschreibung beachten' : 'Case sensitive'}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !answer.trim()}
        className="w-full rounded-lg bg-white px-6 py-4 font-semibold text-navy-900 shadow-lg transition-all hover:bg-sand-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitLabel}
      </button>
    </form>
  )
}
