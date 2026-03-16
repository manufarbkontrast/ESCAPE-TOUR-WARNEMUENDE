'use client'

import { useState, useRef, useCallback } from 'react'
import type { Puzzle } from '@escape-tour/shared'

interface CombinationPuzzleProps {
  readonly puzzle: Puzzle
  readonly language: 'de' | 'en'
  readonly onSubmit: (answer: string) => Promise<void>
  readonly isSubmitting: boolean
}

const CODE_LENGTH = 4

export function CombinationPuzzle({ puzzle, language, onSubmit, isSubmitting }: CombinationPuzzleProps) {
  const [digits, setDigits] = useState<readonly string[]>(Array.from({ length: CODE_LENGTH }, () => ''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const instruction = language === 'de' ? puzzle.instructionDe : (puzzle.instructionEn ?? puzzle.instructionDe)
  const isComplete = digits.every((d) => d !== '')
  const submitLabel = isSubmitting
    ? (language === 'de' ? 'Prüfe...' : 'Checking...')
    : (language === 'de' ? 'Antwort prüfen' : 'Check answer')

  const setInputRef = useCallback((index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el
  }, [])

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase()
    if (!char) return

    const updated = digits.map((d, i) => (i === index ? char : d))
    setDigits(updated)

    if (index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else {
        const updated = digits.map((d, i) => (i === index ? '' : d))
        setDigits(updated)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').toUpperCase().slice(0, CODE_LENGTH)
    const updated = digits.map((_, i) => pasted[i] ?? '')
    setDigits(updated)

    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isComplete) return
    await onSubmit(digits.join(''))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Instruction */}
      {instruction && (
        <div className="flex items-start gap-3 rounded-lg bg-dark-800 p-3">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-dark-200 font-medium">{instruction}</p>
        </div>
      )}

      {/* Code Input Fields */}
      <div className="flex justify-center gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={setInputRef(index)}
            type="text"
            inputMode="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isSubmitting}
            className="h-16 w-14 rounded-lg border-2 border-white/20 bg-dark-900 text-center text-3xl font-bold text-white shadow-xl transition-all focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
            autoComplete="off"
            aria-label={`${language === 'de' ? 'Zeichen' : 'Character'} ${index + 1}`}
          />
        ))}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !isComplete}
        className="w-full rounded-lg bg-white px-6 py-4 font-semibold text-dark-950 shadow-lg transition-all hover:bg-dark-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  )
}
