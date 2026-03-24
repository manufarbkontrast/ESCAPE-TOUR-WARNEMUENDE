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

 const instruction = language === 'de' ? puzzle.instructionDe : (puzzle.instructionEn ?? puzzle.instructionDe)
 const placeholder = language === 'de' ? 'Was haben Sie entdeckt?' : 'What did you discover?'
 const submitLabel = isSubmitting
  ? (language === 'de' ? 'Prüfe...' : 'Checking...')
  : (language === 'de' ? 'Antwort prüfen' : 'Check answer')
 const observeHint = language === 'de'
  ? 'Betrachten Sie das Bild genau und beantworten Sie die Frage.'
  : 'Observe the image carefully and answer the question.'

 return (
  <form onSubmit={handleSubmit} className="space-y-5">
   {/* Puzzle Image */}
   {puzzle.imageUrl && (
    <div className="overflow-hidden rounded-lg border-2 border-white/10 shadow-lg">
     <img
      src={puzzle.imageUrl}
      alt={language === 'de' ? 'Suchbild' : 'Search image'}
      className="w-full object-contain"
      draggable={false}
     />
    </div>
   )}

   {/* Observation Hint */}
   <div className="flex items-start gap-3 rounded-lg bg-dark-800/60 backdrop-blur-sm p-3">
    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
     <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
     <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
    <p className="text-sm text-white/70 font-semibold">
     {instruction ?? observeHint}
    </p>
   </div>

   {/* Answer Input */}
   <input
    type="text"
    value={answer}
    onChange={(e) => setAnswer(e.target.value)}
    placeholder={placeholder}
    disabled={isSubmitting}
    className="w-full rounded-lg border-2 border-white/20 bg-dark-900/70 backdrop-blur-sm px-4 py-4 text-lg text-white placeholder-dark-500 shadow-lg transition-all focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
    autoComplete="off"
    autoCorrect="off"
    spellCheck={false}
   />

   {/* Case Sensitive Hint */}
   {puzzle.caseSensitive && (
    <p className="text-xs italic text-white/60">
     {language === 'de' ? 'Groß-/Kleinschreibung beachten' : 'Case sensitive'}
    </p>
   )}

   {/* Submit Button */}
   <button
    type="submit"
    disabled={isSubmitting || !answer.trim()}
    className="w-full rounded-lg bg-white px-6 py-4 font-semibold text-dark-950 shadow-lg transition-all hover:bg-dark-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
   >
    {submitLabel}
   </button>
  </form>
 )
}
