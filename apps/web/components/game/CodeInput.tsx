'use client'

import { useState, useRef, useEffect } from 'react'

interface CodeInputProps {
  readonly length?: number
  readonly onComplete: (code: string) => void
  readonly isSubmitting?: boolean
  readonly error?: string | null
  readonly language?: 'de' | 'en'
}

export function CodeInput({
  length = 6,
  onComplete,
  isSubmitting = false,
  error = null,
  language = 'de',
}: CodeInputProps) {
  const [values, setValues] = useState<readonly string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^[A-Za-z0-9]?$/.test(value)) return

    const newValues = [...values]
    newValues[index] = value.toUpperCase()
    setValues(newValues)

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newValues.every((v) => v !== '')) {
      onComplete(newValues.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (values[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else {
        const newValues = [...values]
        newValues[index] = ''
        setValues(newValues)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '')
    const newValues = Array(length).fill('')

    for (let i = 0; i < Math.min(pastedText.length, length); i++) {
      newValues[i] = pastedText[i]
    }

    setValues(newValues)

    const nextEmptyIndex = newValues.findIndex((v) => v === '')
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()

    if (newValues.every((v) => v !== '')) {
      onComplete(newValues.join(''))
    }
  }

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            maxLength={1}
            value={values[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={isSubmitting}
            className={`h-14 w-12 rounded-lg border-2 bg-navy-900 text-center text-2xl font-bold uppercase shadow-lg transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? 'border-red-500 text-red-400 focus:border-red-400 focus:ring-red-400/50'
                : 'border-brass-500 text-brass-400 focus:border-brass-400 focus:ring-brass-400/50'
            }`}
            aria-label={`${language === 'de' ? 'Zeichen' : 'Character'} ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center justify-center gap-2 text-sm text-red-400">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {isSubmitting && (
        <div className="text-center text-sm text-sand-400">
          {language === 'de' ? 'Wird überprüft...' : 'Checking...'}
        </div>
      )}
    </div>
  )
}
