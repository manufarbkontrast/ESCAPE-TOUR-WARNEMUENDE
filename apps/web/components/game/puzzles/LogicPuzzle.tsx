'use client'

import { useState } from 'react'
import type { Puzzle } from '@escape-tour/shared'

interface LogicPuzzleProps {
  readonly puzzle: Puzzle
  readonly language: 'de' | 'en'
  readonly onSubmit: (answer: string) => Promise<void>
  readonly isSubmitting: boolean
}

export function LogicPuzzle({ puzzle, language, onSubmit, isSubmitting }: LogicPuzzleProps) {
  const [textAnswer, setTextAnswer] = useState('')
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  const hasOptions = puzzle.options !== null && puzzle.options.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hasOptions) {
      if (!selectedOptionId) return
      await onSubmit(selectedOptionId)
    } else {
      if (!textAnswer.trim()) return
      await onSubmit(textAnswer.trim())
    }
  }

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptionId(optionId)
  }

  const instruction = language === 'de' ? puzzle.instructionDe : (puzzle.instructionEn ?? puzzle.instructionDe)
  const placeholder = language === 'de' ? 'Ihre Antwort eingeben...' : 'Enter your answer...'
  const submitLabel = isSubmitting
    ? (language === 'de' ? 'Prüfe...' : 'Checking...')
    : (language === 'de' ? 'Antwort prüfen' : 'Check answer')
  const canSubmit = hasOptions ? selectedOptionId !== null : textAnswer.trim() !== ''

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Instruction */}
      {instruction && (
        <div className="flex items-start gap-3 rounded-lg bg-navy-800 p-3">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brass-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-sand-300">{instruction}</p>
        </div>
      )}

      {/* Reference Image */}
      {puzzle.imageUrl && (
        <div className="overflow-hidden rounded-lg border-2 border-brass-500/30 shadow-lg">
          <img
            src={puzzle.imageUrl}
            alt={language === 'de' ? 'Rätsel-Bild' : 'Puzzle image'}
            className="w-full object-contain"
            draggable={false}
          />
        </div>
      )}

      {/* Multiple Choice Options */}
      {hasOptions ? (
        <div className="space-y-3">
          {puzzle.options!.map((option) => {
            const optionText = language === 'de' ? option.textDe : (option.textEn ?? option.textDe)
            const isSelected = selectedOptionId === option.id

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionSelect(option.id)}
                disabled={isSubmitting}
                className={`w-full rounded-lg border-2 px-4 py-3 text-left text-base transition-all disabled:opacity-50 ${
                  isSelected
                    ? 'border-brass-500 bg-brass-500/10 text-brass-400'
                    : 'border-navy-600 bg-navy-800 text-sand-300 hover:border-brass-500/50 hover:bg-navy-700'
                }`}
              >
                {optionText}
              </button>
            )
          })}
        </div>
      ) : (
        /* Text Input Fallback */
        <input
          type="text"
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="w-full rounded-lg border-2 border-brass-500 bg-navy-900 px-4 py-4 text-lg text-sand-50 placeholder-sand-500 shadow-lg transition-all focus:border-brass-400 focus:outline-none focus:ring-2 focus:ring-brass-400/50 disabled:opacity-50"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      )}

      {/* Case Sensitive Hint (text mode only) */}
      {!hasOptions && puzzle.caseSensitive && (
        <p className="text-xs italic text-sand-400">
          {language === 'de' ? 'Groß-/Kleinschreibung beachten' : 'Case sensitive'}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !canSubmit}
        className="w-full rounded-lg bg-brass-500 px-6 py-4 font-semibold text-navy-900 shadow-lg transition-all hover:bg-brass-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  )
}
