'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AudioPlayerProps {
 readonly src: string
 readonly loop?: boolean
 readonly volume?: number
}

// ---------------------------------------------------------------------------
// AudioPlayer component
// ---------------------------------------------------------------------------

export function AudioPlayer({
 src,
 loop = true,
 volume = 0.3,
}: AudioPlayerProps) {
 const audioRef = useRef<HTMLAudioElement | null>(null)
 const [isMuted, setIsMuted] = useState(false)
 const [hasInteracted, setHasInteracted] = useState(false)
 const [isReady, setIsReady] = useState(false)

 // Create audio element on mount
 useEffect(() => {
  const audio = new Audio(src)
  audio.loop = loop
  audio.volume = isMuted ? 0 : volume
  audio.preload = 'auto'

  audio.addEventListener('canplaythrough', () => {
   setIsReady(true)
  })

  audio.addEventListener('error', () => {
   // Silently fail - ambient audio is non-critical
   setIsReady(false)
  })

  audioRef.current = audio

  return () => {
   audio.pause()
   audio.removeAttribute('src')
   audio.load()
   audioRef.current = null
  }
 }, [src, loop]) // eslint-disable-line react-hooks/exhaustive-deps

 // Update volume when props change or mute state changes
 useEffect(() => {
  if (!audioRef.current) return
  audioRef.current.volume = isMuted ? 0 : volume
 }, [volume, isMuted])

 // Attempt autoplay, fall back to requiring interaction
 useEffect(() => {
  if (!audioRef.current || !isReady) return

  const attemptPlay = async () => {
   try {
    await audioRef.current?.play()
    setHasInteracted(true)
   } catch {
    // Autoplay blocked - user must interact first
    setHasInteracted(false)
   }
  }

  attemptPlay()
 }, [isReady])

 const handleToggle = useCallback(() => {
  if (!audioRef.current) return

  if (!hasInteracted) {
   audioRef.current
    .play()
    .then(() => {
     setHasInteracted(true)
     setIsMuted(false)
    })
    .catch(() => {
     // Audio playback not allowed
    })
   return
  }

  setIsMuted((prev) => !prev)
 }, [hasInteracted])

 // Determine icon state
 const showSpeaker = hasInteracted && !isMuted
 const showMuted = hasInteracted && isMuted
 const showPlay = !hasInteracted

 return (
  <button
   onClick={handleToggle}
   className="fixed bottom-20 right-4 z-30 rounded-full bg-dark-800/80 p-3 shadow-lg backdrop-blur-sm transition-all hover:bg-dark-700/80 active:scale-95"
   aria-label={
    showPlay
     ? 'Audio abspielen'
     : showSpeaker
      ? 'Audio stumm schalten'
      : 'Audio aktivieren'
   }
  >
   {showSpeaker && (
    <svg
     className="h-5 w-5 text-white"
     fill="none"
     viewBox="0 0 24 24"
     stroke="currentColor"
     strokeWidth={2}
    >
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.5H4a1 1 0 00-1 1v5a1 1 0 001 1h2.5l4.5 4V4.5l-4.5 4z"
     />
    </svg>
   )}
   {showMuted && (
    <svg
     className="h-5 w-5 text-white/50"
     fill="none"
     viewBox="0 0 24 24"
     stroke="currentColor"
     strokeWidth={2}
    >
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
     />
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
     />
    </svg>
   )}
   {showPlay && (
    <svg
     className="h-5 w-5 text-white/50"
     fill="none"
     viewBox="0 0 24 24"
     stroke="currentColor"
     strokeWidth={2}
    >
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
     />
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
     />
    </svg>
   )}
  </button>
 )
}
