'use client'

import { useState, useRef, useCallback } from 'react'
import type { Puzzle } from '@escape-tour/shared'

interface ClockPuzzleProps {
  readonly puzzle: Puzzle
  readonly language: 'de' | 'en'
  readonly onSubmit: (answer: string) => Promise<void>
  readonly isSubmitting: boolean
}

const CLOCK_SIZE = 280
const CENTER = CLOCK_SIZE / 2
const HOUR_HAND_LENGTH = 70
const MINUTE_HAND_LENGTH = 100
const TICK_OUTER = 125
const TICK_INNER_HOUR = 110
const TICK_INNER_MINUTE = 118

function angleToPosition(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

function pointerAngle(
  clientX: number,
  clientY: number,
  svgRect: DOMRect,
): number {
  const dx = clientX - svgRect.left - CENTER
  const dy = clientY - svgRect.top - CENTER
  let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90
  if (deg < 0) deg += 360
  return deg
}

function snapMinutes(angle: number): number {
  return Math.round(angle / 6) % 60
}

function snapHours(angle: number): number {
  return Math.round(angle / 30) % 12
}

function padTwo(n: number): string {
  return n.toString().padStart(2, '0')
}

export function ClockPuzzle({ puzzle, language, onSubmit, isSubmitting }: ClockPuzzleProps) {
  const [hours, setHours] = useState(12)
  const [minutes, setMinutes] = useState(0)
  const [isPM, setIsPM] = useState(false)
  const [activeHand, setActiveHand] = useState<'hour' | 'minute' | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const displayHour24 = isPM ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours)
  const timeString = `${padTwo(displayHour24)}:${padTwo(minutes)}`

  const hourAngle = (hours % 12) * 30 + minutes * 0.5
  const minuteAngle = minutes * 6

  const hourTip = angleToPosition(hourAngle, HOUR_HAND_LENGTH)
  const minuteTip = angleToPosition(minuteAngle, MINUTE_HAND_LENGTH)

  const handlePointerDown = useCallback((hand: 'hour' | 'minute') => {
    setActiveHand(hand)
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!activeHand || !svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const angle = pointerAngle(e.clientX, e.clientY, rect)

      if (activeHand === 'minute') {
        setMinutes(snapMinutes(angle))
      } else {
        setHours(snapHours(angle) || 12)
      }
    },
    [activeHand],
  )

  const handlePointerUp = useCallback(() => {
    setActiveHand(null)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(timeString)
  }

  const instruction = language === 'de' ? puzzle.instructionDe : (puzzle.instructionEn ?? puzzle.instructionDe)
  const submitLabel = isSubmitting
    ? (language === 'de' ? 'Prüfe...' : 'Checking...')
    : (language === 'de' ? 'Uhrzeit prüfen' : 'Check time')

  // Clock tick marks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const isHourMark = i % 5 === 0
    const outer = angleToPosition(i * 6, TICK_OUTER)
    const inner = angleToPosition(i * 6, isHourMark ? TICK_INNER_HOUR : TICK_INNER_MINUTE)
    return { i, outer, inner, isHourMark }
  })

  // Hour labels at 12/3/6/9
  const hourLabels = [12, 3, 6, 9].map((h) => {
    const pos = angleToPosition(h * 30, 95)
    return { h, ...pos }
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {instruction && (
        <div className="flex items-start gap-3 rounded-lg bg-dark-800/60 backdrop-blur-sm p-3">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-white/70 font-semibold">{instruction}</p>
        </div>
      )}

      {/* Clock Face */}
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          width={CLOCK_SIZE}
          height={CLOCK_SIZE}
          viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
          className="select-none"
          style={{ touchAction: 'none' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Outer ring */}
          <circle cx={CENTER} cy={CENTER} r={132} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />

          {/* Face background */}
          <circle cx={CENTER} cy={CENTER} r={130} fill="rgba(10, 10, 10, 0.7)" />

          {/* Inner decorative ring */}
          <circle cx={CENTER} cy={CENTER} r={128} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />

          {/* Tick marks */}
          {ticks.map(({ i, outer, inner, isHourMark }) => (
            <line
              key={i}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke={isHourMark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)'}
              strokeWidth={isHourMark ? 2 : 1}
            />
          ))}

          {/* Hour labels */}
          {hourLabels.map(({ h, x, y }) => (
            <text
              key={h}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="rgba(255,255,255,0.8)"
              fontSize={18}
              fontWeight={600}
              fontFamily="system-ui, sans-serif"
            >
              {h}
            </text>
          ))}

          {/* Hour hand + hit area */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={hourTip.x}
            y2={hourTip.y}
            stroke="white"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <line
            x1={CENTER}
            y1={CENTER}
            x2={hourTip.x}
            y2={hourTip.y}
            stroke="transparent"
            strokeWidth={24}
            strokeLinecap="round"
            style={{ cursor: 'grab' }}
            onPointerDown={(e) => {
              e.preventDefault()
              handlePointerDown('hour')
            }}
          />

          {/* Minute hand + hit area */}
          <line
            x1={CENTER}
            y1={CENTER}
            x2={minuteTip.x}
            y2={minuteTip.y}
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={CENTER}
            y1={CENTER}
            x2={minuteTip.x}
            y2={minuteTip.y}
            stroke="transparent"
            strokeWidth={24}
            strokeLinecap="round"
            style={{ cursor: 'grab' }}
            onPointerDown={(e) => {
              e.preventDefault()
              handlePointerDown('minute')
            }}
          />

          {/* Center dot */}
          <circle cx={CENTER} cy={CENTER} r={5} fill="white" />
        </svg>
      </div>

      {/* AM/PM Toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsPM(false)}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          style={{
            background: !isPM ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${!isPM ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
            color: !isPM ? 'white' : 'rgba(255,255,255,0.4)',
          }}
        >
          {language === 'de' ? 'Vormittag' : 'AM'}
        </button>
        <button
          type="button"
          onClick={() => setIsPM(true)}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          style={{
            background: isPM ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isPM ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
            color: isPM ? 'white' : 'rgba(255,255,255,0.4)',
          }}
        >
          {language === 'de' ? 'Nachmittag' : 'PM'}
        </button>
      </div>

      {/* Digital time display */}
      <div className="text-center">
        <span
          className="text-4xl font-bold tabular-nums tracking-widest text-white"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {timeString}
        </span>
        <p className="mt-1 text-xs text-white/40">
          {language === 'de' ? 'Zieht die Zeiger auf die richtige Uhrzeit' : 'Drag the hands to the correct time'}
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full py-3.5 text-base font-semibold"
      >
        {submitLabel}
      </button>
    </form>
  )
}
