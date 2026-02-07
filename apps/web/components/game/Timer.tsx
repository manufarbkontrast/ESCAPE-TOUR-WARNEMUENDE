'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'

interface TimerProps {
  readonly sessionId: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function Timer({ sessionId }: TimerProps) {
  const session = useGameStore((state) => state.session)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!session || session.id !== sessionId) return

    const calculateElapsed = () => {
      if (!session.startedAt) return 0

      const startTime = new Date(session.startedAt).getTime()
      const now = Date.now()
      const totalSeconds = Math.floor((now - startTime) / 1000)

      return Math.max(0, totalSeconds - session.totalPauseSeconds)
    }

    const isPaused = session.status === 'paused'

    if (isPaused) {
      setElapsedSeconds(calculateElapsed())
      return
    }

    setElapsedSeconds(calculateElapsed())

    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsed())
    }, 1000)

    return () => clearInterval(interval)
  }, [session, sessionId])

  if (!session) return null

  const isPaused = session.status === 'paused'

  return (
    <div className="flex items-center gap-2">
      <svg
        className={`h-5 w-5 ${isPaused ? 'text-sand-400' : 'text-brass-400'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
      <span className={`font-mono text-sm font-semibold ${isPaused ? 'text-sand-400' : 'text-sand-50'}`}>
        {formatTime(elapsedSeconds)}
      </span>
      {isPaused && (
        <span className="ml-1 text-xs text-sand-400">(paused)</span>
      )}
    </div>
  )
}
