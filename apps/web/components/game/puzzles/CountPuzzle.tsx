'use client'

import { useState } from 'react'
import type { Puzzle } from '@escape-tour/shared'

interface CountPuzzleProps {
 readonly puzzle: Puzzle
 readonly language: 'de' | 'en'
 readonly onSubmit: (answer: number) => Promise<void>
 readonly isSubmitting: boolean
}

export function CountPuzzle({ puzzle, language, onSubmit, isSubmitting }: CountPuzzleProps) {
 const [count, setCount] = useState(0)

 const handleDecrement = () => {
  setCount((prev) => Math.max(0, prev - 1))
 }

 const handleIncrement = () => {
  setCount((prev) => prev + 1)
 }

 const handleChange = (value: string) => {
  const numValue = parseInt(value, 10)
  if (!isNaN(numValue) && numValue >= 0) {
   setCount(numValue)
  } else if (value === '') {
   setCount(0)
  }
 }

 const handleSubmit = async () => {
  await onSubmit(count)
 }

 return (
  <div className="space-y-6">
   {/* Counter Display */}
   <div className="flex items-center justify-center gap-4">
    <button
     onClick={handleDecrement}
     disabled={isSubmitting || count === 0}
     className="flex h-14 w-14 items-center justify-center rounded-full bg-dark-700/60 backdrop-blur-sm text-2xl font-bold text-white shadow-lg transition-all hover:bg-dark-600/70 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
     aria-label={language === 'de' ? 'Verringern' : 'Decrease'}
    >
     −
    </button>

    <div className="relative">
     <input
      type="number"
      value={count}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isSubmitting}
      className="h-20 w-32 rounded-lg border-2 border-white/20 bg-dark-900/70 backdrop-blur-sm text-center text-4xl font-bold text-white shadow-xl focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
      min="0"
     />
    </div>

    <button
     onClick={handleIncrement}
     disabled={isSubmitting}
     className="flex h-14 w-14 items-center justify-center rounded-full bg-dark-700/60 backdrop-blur-sm text-2xl font-bold text-white shadow-lg transition-all hover:bg-dark-600/70 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
     aria-label={language === 'de' ? 'Erhöhen' : 'Increase'}
    >
     +
    </button>
   </div>

   {/* Submit Button */}
   <button
    onClick={handleSubmit}
    disabled={isSubmitting}
    className="w-full rounded-lg bg-white px-6 py-4 font-semibold text-dark-950 shadow-lg transition-all hover:bg-dark-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
   >
    {isSubmitting
     ? (language === 'de' ? 'Wird überprüft...' : 'Checking...')
     : (language === 'de' ? 'Antwort einreichen' : 'Submit Answer')}
   </button>
  </div>
 )
}
