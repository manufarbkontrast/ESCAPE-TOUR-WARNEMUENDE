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
        <div className="flex items-start gap-3 rounded-lg bg-dark-800 p-3">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-dark-200 font-medium">{instruction}</p>
        </div>
      )}

      {/* Reference Image */}
      {puzzle.imageUrl && (
        <div className="overflow-hidden rounded-lg border-2 border-white/10 shadow-lg">
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
                    ? 'border-white/20 bg-white/5 text-white'
                    : 'border-dark-600 bg-dark-800 text-dark-200 hover:border-white/20 hover:bg-dark-700'
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
          className="w-full rounded-lg border-2 border-white/20 bg-dark-900 px-4 py-4 text-lg text-white placeholder-dark-500 shadow-lg transition-all focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      )}

      {/* Case Sensitive Hint (text mode only) */}
      {!hasOptions && puzzle.caseSensitive && (
        <p className="text-xs italic text-dark-300">
          {language === 'de' ? 'Groß-/Kleinschreibung beachten' : 'Case sensitive'}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !canSubmit}
        className="w-full rounded-lg bg-white px-6 py-4 font-semibold text-dark-950 shadow-lg transition-all hover:bg-dark-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  )
}
