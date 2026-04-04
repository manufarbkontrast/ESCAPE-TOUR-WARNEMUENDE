'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface PuzzleCountdownProps {
  readonly maxSeconds: number
  readonly isActive: boolean
  readonly onExpired?: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PuzzleCountdown({ maxSeconds, isActive, onExpired }: PuzzleCountdownProps) {
  const [remaining, setRemaining] = useState(maxSeconds)
  const onExpiredRef = useRef(onExpired)
  onExpiredRef.current = onExpired

  useEffect(() => {
    if (!isActive || remaining <= 0) return

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1
        if (next <= 0) {
          onExpiredRef.current?.()
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, remaining])

  const progress = remaining / maxSeconds
  const isUrgent = remaining <= 30
  const isCritical = remaining <= 10

  return (
    <div className="flex items-center gap-2.5">
      {/* Progress bar */}
      <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: '100%' }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{
            background: isCritical
              ? 'rgba(239, 68, 68, 0.8)'
              : isUrgent
                ? 'rgba(251, 191, 36, 0.6)'
                : 'rgba(255, 255, 255, 0.3)',
          }}
        />
      </div>

      {/* Time display */}
      <span
        className={`tabular-nums text-sm font-semibold ${
          isCritical ? 'text-red-400' : isUrgent ? 'text-amber-400/70' : 'text-white/40'
        }`}
      >
        {formatTime(remaining)}
      </span>
    </div>
  )
}
