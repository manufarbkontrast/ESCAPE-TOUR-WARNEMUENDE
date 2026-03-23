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
   <div className="flex items-start gap-3 rounded-lg bg-dark-800 p-4">
    <svg className="mt-0.5 h-6 w-6 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
     <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
    <p className="text-sm text-white/70 font-semibold">
     {instruction ?? searchHint}
    </p>
   </div>

   {/* Reference Image */}
   {puzzle.imageUrl && (
    <div className="overflow-hidden rounded-lg border-2 border-white/10 shadow-lg">
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
    className="w-full rounded-lg border-2 border-white/20 bg-dark-900 px-4 py-4 text-center text-2xl font-bold tracking-widest text-white placeholder-dark-500 shadow-lg transition-all focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
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
