'use client'

import { useState } from 'react'
import type { Puzzle } from '@escape-tour/shared'

interface SymbolFindPuzzleProps {
  readonly puzzle: Puzzle
  readonly language: 'de' | 'en'
  readonly onSubmit: (answer: string) => Promise<void>
  readonly isSubmitting: boolean
}

export function SymbolFindPuzzle({ puzzle, language, onSubmit, isSubmitting }: SymbolFindPuzzleProps) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return
    await onSubmit(answer.trim())
  }

  const instruction = language === 'de' ? puzzle.instructionDe : (puzzle.instructionEn ?? puzzle.instructionDe)
  const placeholder = language === 'de' ? 'Symbol oder Text eingeben...' : 'Enter symbol or text...'
  const submitLabel = isSubmitting
    ? (language === 'de' ? 'Prüfe...' : 'Checking...')
    : (language === 'de' ? 'Antwort prüfen' : 'Check answer')
  const searchHint = language === 'de'
    ? 'Suchen Sie an der beschriebenen Stelle nach dem Symbol oder Text.'
    : 'Look for the symbol or text at the described location.'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Search Hint */}
      <div className="flex items-start gap-3 rounded-lg bg-navy-800 p-4">
        <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-brass-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-sand-300">
          {instruction ?? searchHint}
        </p>
      </div>

      {/* Reference Image */}
      {puzzle.imageUrl && (
        <div className="overflow-hidden rounded-lg border-2 border-brass-500/30 shadow-lg">
          <img
            src={puzzle.imageUrl}
            alt={language === 'de' ? 'Hinweisbild' : 'Hint image'}
            className="w-full object-contain"
            draggable={false}
          />
        </div>
      )}

      {/* Answer Input */}
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={placeholder}
        disabled={isSubmitting}
        className="w-full rounded-lg border-2 border-brass-500 bg-navy-900 px-4 py-4 text-center text-2xl font-bold tracking-widest text-brass-400 placeholder-sand-500 shadow-lg transition-all focus:border-brass-400 focus:outline-none focus:ring-2 focus:ring-brass-400/50 disabled:opacity-50"
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
        className="w-full rounded-lg bg-brass-500 px-6 py-4 font-semibold text-navy-900 shadow-lg transition-all hover:bg-brass-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  )
}
