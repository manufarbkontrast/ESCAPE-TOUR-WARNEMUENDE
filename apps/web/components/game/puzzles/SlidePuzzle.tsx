'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Puzzle } from '@escape-tour/shared'

interface SlidePuzzleProps {
  readonly puzzle: Puzzle
  readonly language: 'de' | 'en'
  readonly onSubmit: (answer: string) => Promise<void>
  readonly isSubmitting: boolean
}

const SOLVED_STATE: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 0]
const GRID_SIZE = 3

function isSolved(tiles: readonly number[]): boolean {
  return tiles.every((val, idx) => val === SOLVED_STATE[idx])
}

function getAdjacentIndices(emptyIdx: number): readonly number[] {
  const row = Math.floor(emptyIdx / GRID_SIZE)
  const col = emptyIdx % GRID_SIZE
  const neighbors: number[] = []

  if (row > 0) neighbors.push(emptyIdx - GRID_SIZE)
  if (row < GRID_SIZE - 1) neighbors.push(emptyIdx + GRID_SIZE)
  if (col > 0) neighbors.push(emptyIdx - 1)
  if (col < GRID_SIZE - 1) neighbors.push(emptyIdx + 1)

  return neighbors
}

function swapTiles(tiles: readonly number[], idxA: number, idxB: number): readonly number[] {
  return tiles.map((val, i) => {
    if (i === idxA) return tiles[idxB]
    if (i === idxB) return tiles[idxA]
    return val
  })
}

function shuffleTiles(): readonly number[] {
  let tiles = [...SOLVED_STATE]
  let emptyIdx = 8
  let lastEmpty = -1

  for (let move = 0; move < 150; move++) {
    const neighbors = getAdjacentIndices(emptyIdx).filter((n) => n !== lastEmpty)
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)]
    tiles = [...swapTiles(tiles, emptyIdx, pick)]
    lastEmpty = emptyIdx
    emptyIdx = pick
  }

  return tiles
}

export function SlidePuzzle({ puzzle, language, onSubmit, isSubmitting }: SlidePuzzleProps) {
  const [tiles, setTiles] = useState<readonly number[]>(SOLVED_STATE)
  const [solved, setSolved] = useState(false)
  const [moves, setMoves] = useState(0)
  const [answer, setAnswer] = useState('')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    setTiles(shuffleTiles())
    setInitialized(true)
  }, [])

  const handleTileClick = useCallback(
    (tileIdx: number) => {
      if (solved) return

      const emptyIdx = tiles.indexOf(0)
      const adjacent = getAdjacentIndices(emptyIdx)

      if (!adjacent.includes(tileIdx)) return

      const newTiles = swapTiles(tiles, tileIdx, emptyIdx)
      setTiles(newTiles)
      setMoves((prev) => prev + 1)

      if (isSolved(newTiles)) {
        setSolved(true)
      }
    },
    [tiles, solved],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return
    await onSubmit(answer.trim())
  }

  const instruction = language === 'de' ? puzzle.instructionDe : (puzzle.instructionEn ?? puzzle.instructionDe)
  const submitLabel = isSubmitting
    ? (language === 'de' ? 'Prüfe...' : 'Checking...')
    : (language === 'de' ? 'Antwort prüfen' : 'Check answer')
  const movesLabel = language === 'de' ? 'Züge' : 'Moves'

  return (
    <div className="space-y-5">
      {instruction && (
        <div className="flex items-start gap-3 rounded-lg bg-dark-800/60 backdrop-blur-sm p-3">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          <p className="text-sm text-white/70 font-semibold">{instruction}</p>
        </div>
      )}

      {/* Puzzle Grid */}
      <div className="flex justify-center">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: 264,
            height: 264,
          }}
        >
          {initialized && tiles.map((tile, idx) => {
            const isEmpty = tile === 0

            if (isEmpty) {
              return (
                <div
                  key="empty"
                  className="rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                />
              )
            }

            const emptyIdx = tiles.indexOf(0)
            const isMovable = getAdjacentIndices(emptyIdx).includes(idx)

            return (
              <button
                key={tile}
                type="button"
                onClick={() => handleTileClick(idx)}
                disabled={solved || !isMovable}
                className="rounded-lg text-xl font-bold transition-all duration-150 select-none"
                style={{
                  background: solved
                    ? 'rgba(34, 197, 94, 0.12)'
                    : isMovable
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${
                    solved
                      ? 'rgba(34, 197, 94, 0.2)'
                      : isMovable
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(255,255,255,0.06)'
                  }`,
                  color: solved ? 'rgba(34, 197, 94, 0.9)' : isMovable ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: isMovable && !solved ? 'pointer' : 'default',
                }}
              >
                {tile}
              </button>
            )
          })}
        </div>
      </div>

      {/* Move counter */}
      <div className="text-center text-sm text-white/40 font-semibold tabular-nums">
        {movesLabel}: {moves}
      </div>

      {/* Solved state: answer input */}
      {solved ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="rounded-lg p-3 text-center"
            style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.15)',
            }}
          >
            <p className="text-sm font-semibold text-green-400">
              {language === 'de' ? 'Puzzle gelöst!' : 'Puzzle solved!'}
            </p>
            <p className="mt-1 text-xs text-green-400/60">
              {language === 'de'
                ? 'Was zeigt das gelöste Bild? Gebt das Lösungswort ein.'
                : 'What does the solved image show? Enter the answer word.'}
            </p>
          </div>

          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={language === 'de' ? 'Lösungswort eingeben...' : 'Enter answer word...'}
            autoFocus
            className="w-full rounded-lg px-4 py-3 text-base font-semibold text-white placeholder-white/30 focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.1)',
            }}
            onFocus={(e) => {
              const el = e.currentTarget
              el.style.borderColor = 'rgba(255,255,255,0.25)'
            }}
            onBlur={(e) => {
              const el = e.currentTarget
              el.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          />

          <button
            type="submit"
            disabled={isSubmitting || !answer.trim()}
            className="btn btn-primary w-full py-3.5 text-base font-semibold"
          >
            {submitLabel}
          </button>
        </form>
      ) : (
        <p className="text-center text-sm text-white/40">
          {language === 'de'
            ? 'Tippt auf eine markierte Kachel, um sie zu verschieben.'
            : 'Tap a highlighted tile to slide it.'}
        </p>
      )}
    </div>
  )
}
