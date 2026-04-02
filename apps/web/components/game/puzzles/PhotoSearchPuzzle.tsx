'use client'

import { useState } from 'react'
import type { Puzzle } from '@escape-tour/shared'

interface PhotoSearchPuzzleProps {
 readonly puzzle: Puzzle
 readonly language: 'de' | 'en'
 readonly onSubmit: (answer: string) => Promise<void>
 readonly isSubmitting: boolean
}

export function PhotoSearchPuzzle({ puzzle, language, onSubmit, isSubmitting }: PhotoSearchPuzzleProps) {
 const [answer, setAnswer] = useState('')

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!answer.trim()) return
  await onSubmit(answer.trim())
 }

 const placeholder = language === 'de' ? 'Eure Antwort...' : 'Your answer...'
 const submitLabel = isSubmitting
  ? (language === 'de' ? 'Prüfe...' : 'Checking...')
  : (language === 'de' ? 'Antwort prüfen' : 'Check answer')

 return (
  <form onSubmit={handleSubmit} className="space-y-4">
   {puzzle.imageUrl && (
    <div className="overflow-hidden rounded-lg border border-white/10">
     <img
      src={puzzle.imageUrl}
      alt={language === 'de' ? 'Suchbild' : 'Search image'}
      className="w-full object-contain"
      draggable={false}
     />
    </div>
   )}

   <input
    type="text"
    value={answer}
    onChange={(e) => setAnswer(e.target.value)}
    placeholder={placeholder}
    disabled={isSubmitting}
    className="w-full rounded-lg px-4 py-3 text-base font-semibold text-white placeholder-white/30 focus:outline-none"
    style={{
     background: 'rgba(255,255,255,0.05)',
     border: '1.5px solid rgba(255,255,255,0.1)',
    }}
    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
    autoComplete="off"
   />

   <button
    type="submit"
    disabled={isSubmitting || !answer.trim()}
    className="btn btn-primary w-full py-3.5 text-base font-semibold"
   >
    {submitLabel}
   </button>
  </form>
 )
}
