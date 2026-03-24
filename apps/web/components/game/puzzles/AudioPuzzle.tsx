'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Puzzle } from '@escape-tour/shared'

interface AudioPuzzleProps {
 readonly puzzle: Puzzle
 readonly language: 'de' | 'en'
 readonly onSubmit: (answer: string) => Promise<void>
 readonly isSubmitting: boolean
}

export function AudioPuzzle({ puzzle, language, onSubmit, isSubmitting }: AudioPuzzleProps) {
 const [answer, setAnswer] = useState('')
 const [isPlaying, setIsPlaying] = useState(false)
 const [progress, setProgress] = useState(0)
 const [duration, setDuration] = useState(0)
 const audioRef = useRef<HTMLAudioElement | null>(null)
 const animationRef = useRef<number | null>(null)

 const updateProgress = useCallback(() => {
  const audio = audioRef.current
  if (audio && audio.duration) {
   setProgress(audio.currentTime / audio.duration)
  }
  animationRef.current = requestAnimationFrame(updateProgress)
 }, [])

 useEffect(() => {
  return () => {
   if (animationRef.current !== null) {
    cancelAnimationFrame(animationRef.current)
   }
   audioRef.current?.pause()
  }
 }, [])

 const togglePlayback = () => {
  const audio = audioRef.current
  if (!audio) return

  if (isPlaying) {
   audio.pause()
   if (animationRef.current !== null) {
    cancelAnimationFrame(animationRef.current)
   }
  } else {
   audio.play()
   animationRef.current = requestAnimationFrame(updateProgress)
  }
  setIsPlaying(!isPlaying)
 }

 const handleEnded = () => {
  setIsPlaying(false)
  setProgress(0)
  if (animationRef.current !== null) {
   cancelAnimationFrame(animationRef.current)
  }
 }

 const handleLoadedMetadata = () => {
  if (audioRef.current) {
   setDuration(audioRef.current.duration)
  }
 }

 const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
  const audio = audioRef.current
  if (!audio || !audio.duration) return

  const rect = e.currentTarget.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const fraction = clickX / rect.width
  audio.currentTime = fraction * audio.duration
  setProgress(fraction)
 }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!answer.trim()) return
  await onSubmit(answer.trim())
 }

 const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
 }

 const currentTime = duration * progress
 const placeholder = language === 'de' ? 'Ihre Antwort eingeben...' : 'Enter your answer...'
 const submitLabel = isSubmitting
  ? (language === 'de' ? 'Prüfe...' : 'Checking...')
  : (language === 'de' ? 'Antwort prüfen' : 'Check answer')
 const noAudioMessage = language === 'de' ? 'Keine Audiodatei verfügbar.' : 'No audio file available.'

 return (
  <form onSubmit={handleSubmit} className="space-y-5">
   {/* Audio Player */}
   {puzzle.audioUrl ? (
    <div className="rounded-lg border-2 border-white/10 bg-dark-800/60 backdrop-blur-sm p-4">
     <audio
      ref={audioRef}
      src={puzzle.audioUrl}
      onEnded={handleEnded}
      onLoadedMetadata={handleLoadedMetadata}
      preload="metadata"
     />

     <div className="flex items-center gap-4">
      {/* Play/Pause Button */}
      <button
       type="button"
       onClick={togglePlayback}
       disabled={isSubmitting}
       className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-dark-950 shadow-lg transition-all hover:bg-dark-100 active:scale-95 disabled:opacity-50"
       aria-label={isPlaying ? (language === 'de' ? 'Pause' : 'Pause') : (language === 'de' ? 'Abspielen' : 'Play')}
      >
       {isPlaying ? (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
       ) : (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
       )}
      </button>

      {/* Progress Bar and Time */}
      <div className="flex flex-1 flex-col gap-1">
       <div
        className="h-2 cursor-pointer rounded-full bg-dark-700"
        onClick={handleProgressClick}
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
       >
        <div
         className="h-full rounded-full bg-white transition-[width] duration-100"
         style={{ width: `${progress * 100}%` }}
        />
       </div>
       <div className="flex justify-between text-xs text-white/60">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
       </div>
      </div>
     </div>
    </div>
   ) : (
    <p className="text-center text-sm text-white/60">{noAudioMessage}</p>
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
