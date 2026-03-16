'use client'

import { useState, useRef, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

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
      <div className="flex justify-center gap-2.5">
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
            className="h-14 w-12 rounded-xl text-center text-xl font-bold uppercase transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(10, 10, 10, 0.6)',
              border: `1.5px solid ${error ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              color: error ? 'rgba(239, 68, 68, 0.8)' : '#ffffff',
              boxShadow: error
                ? '0 0 0 3px rgba(239, 68, 68, 0.06)'
                : '0 0 0 3px rgba(255, 255, 255, 0.02), inset 0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
            onFocusCapture={(e) => {
              const el = e.currentTarget
              el.style.borderColor = error ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.25)'
              el.style.boxShadow = error
                ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
                : '0 0 0 3px rgba(255, 255, 255, 0.05), 0 0 12px rgba(255, 255, 255, 0.04)'
            }}
            onBlurCapture={(e) => {
              const el = e.currentTarget
              el.style.borderColor = error ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'
              el.style.boxShadow = error
                ? '0 0 0 3px rgba(239, 68, 68, 0.06)'
                : '0 0 0 3px rgba(255, 255, 255, 0.02), inset 0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
            aria-label={`${language === 'de' ? 'Zeichen' : 'Character'} ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center justify-center gap-2 text-sm text-red-400/80">
          <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>{error}</span>
        </div>
      )}

      {isSubmitting && (
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-white/20 border-t-transparent" />
          <span className="text-sm text-dark-500">
            {language === 'de' ? 'Wird überprüft...' : 'Checking...'}
          </span>
        </div>
      )}
    </div>
  )
}
