'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Puzzle } from '@escape-tour/shared'

interface ARPuzzleProps {
 readonly puzzle: Puzzle
 readonly language: 'de' | 'en'
 readonly onSubmit: (answer: string) => Promise<void>
 readonly isSubmitting: boolean
}

export function ARPuzzle({ puzzle, language, onSubmit, isSubmitting }: ARPuzzleProps) {
 const [answer, setAnswer] = useState('')
 const [cameraActive, setCameraActive] = useState(false)
 const [cameraError, setCameraError] = useState<string | null>(null)
 const videoRef = useRef<HTMLVideoElement | null>(null)
 const streamRef = useRef<MediaStream | null>(null)

 const stopCamera = useCallback(() => {
  if (streamRef.current) {
   streamRef.current.getTracks().forEach((track) => track.stop())
   streamRef.current = null
  }
  setCameraActive(false)
 }, [])

 useEffect(() => {
  return () => {
   if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop())
   }
  }
 }, [])

 const startCamera = async () => {
  try {
   setCameraError(null)
   const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
   })
   streamRef.current = stream
   if (videoRef.current) {
    videoRef.current.srcObject = stream
   }
   setCameraActive(true)
  } catch {
   setCameraError(
    language === 'de'
     ? 'Kamera konnte nicht gestartet werden. Bitte erlauben Sie den Zugriff.'
     : 'Could not start camera. Please allow access.'
   )
  }
 }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!answer.trim()) return
  stopCamera()
  await onSubmit(answer.trim())
 }

 const overlayText = puzzle.arContent?.overlayText ?? null
 const targetDescription = puzzle.arContent?.targetDescription ?? null
 const instruction = language === 'de' ? puzzle.instructionDe : (puzzle.instructionEn ?? puzzle.instructionDe)
 const placeholder = language === 'de' ? 'Ihre Antwort eingeben...' : 'Enter your answer...'
 const submitLabel = isSubmitting
  ? (language === 'de' ? 'Prüfe...' : 'Checking...')
  : (language === 'de' ? 'Antwort prüfen' : 'Check answer')

 return (
  <form onSubmit={handleSubmit} className="space-y-5">
   {/* Instruction / Target Description */}
   <div className="flex items-start gap-3 rounded-lg bg-dark-800/60 backdrop-blur-sm p-3">
    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
     <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
     <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
    <p className="text-sm text-white/70 font-semibold">
     {instruction ?? targetDescription ?? (language === 'de'
      ? 'Richten Sie die Kamera auf das Ziel und finden Sie die Antwort.'
      : 'Point the camera at the target and find the answer.')}
    </p>
   </div>

   {/* Camera View */}
   <div className="relative overflow-hidden rounded-lg border-2 border-white/10 bg-dark-900">
    {cameraActive ? (
     <div className="relative">
      <video
       ref={videoRef}
       autoPlay
       playsInline
       muted
       className="w-full"
      />
      {/* AR Overlay Frame */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
       <div className="h-48 w-48 rounded-lg border-2 border-dashed border-white/20" />
      </div>
      {overlayText && (
       <div className="absolute bottom-2 left-2 right-2 rounded bg-dark-900/80 px-3 py-1.5 text-center text-sm text-white">
        {overlayText}
       </div>
      )}
      <button
       type="button"
       onClick={stopCamera}
       className="absolute right-2 top-2 rounded-full bg-dark-900/80 p-2 text-white/70 hover:text-white"
       aria-label={language === 'de' ? 'Kamera schließen' : 'Close camera'}
      >
       <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
       </svg>
      </button>
     </div>
    ) : (
     <button
      type="button"
      onClick={startCamera}
      disabled={isSubmitting}
      className="flex w-full flex-col items-center justify-center gap-3 py-16 text-white/60 transition-colors hover:text-white disabled:opacity-50"
     >
      <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
       <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
      <span className="text-sm font-semibold">
       {language === 'de' ? 'Kamera aktivieren' : 'Activate camera'}
      </span>
     </button>
    )}
   </div>

   {/* Camera Error */}
   {cameraError && (
    <p className="text-sm text-red-400">{cameraError}</p>
   )}

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
