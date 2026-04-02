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

 const placeholder = language === 'de' ? 'Eure Antwort...' : 'Your answer...'
 const submitLabel = isSubmitting
  ? (language === 'de' ? 'Prüfe...' : 'Checking...')
  : (language === 'de' ? 'Antwort prüfen' : 'Check answer')

 return (
  <form onSubmit={handleSubmit} className="space-y-4">
   {puzzle.imageUrl && (
    <div className="relative">
     <button
      type="button"
      onClick={() => setIsZoomed((prev) => !prev)}
      className="w-full overflow-hidden rounded-lg border border-white/10 transition-all focus:outline-none"
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
