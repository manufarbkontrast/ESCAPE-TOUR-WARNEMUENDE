'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { Station, Puzzle, GameSession, ApiResponse } from '@escape-tour/shared'
import { useGameStore } from '@/stores/gameStore'
import { MapView } from '@/components/game/MapView'
import { StationView } from '@/components/game/StationView'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GameView = 'map' | 'station'

interface SessionData {
  readonly session: GameSession
  readonly stations: readonly Station[]
  readonly puzzles: readonly Puzzle[]
}

type LoadingState = 'loading' | 'ready' | 'error'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  {
    view: 'map' as GameView,
    labelDe: 'Karte',
    labelEn: 'Map',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    view: 'station' as GameView,
    labelDe: 'Station',
    labelEn: 'Station',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
] as const

const viewTransition = {
  initial: { opacity: 0, x: 0 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 0, transition: { duration: 0.2 } },
} as const

// ---------------------------------------------------------------------------
// GamePage component
// ---------------------------------------------------------------------------

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [activeView, setActiveView] = useState<GameView>('map')
  const [loadingState, setLoadingState] = useState<LoadingState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [stations, setStations] = useState<readonly Station[]>([])
  const [puzzles, setPuzzles] = useState<readonly Puzzle[]>([])
  const [language] = useState<'de' | 'en'>('de')

  const { session, setSession, updateProgress, completeSession } = useGameStore()

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      setLoadingState('loading')
      setErrorMessage(null)

      try {
        const response = await fetch(`/api/game/session?id=${encodeURIComponent(sessionId)}`)

        if (!response.ok) {
          if (response.status === 404) {
            setErrorMessage('Sitzung nicht gefunden. Bitte gebt euren Code erneut ein.')
            setLoadingState('error')
            return
          }
          throw new Error('Failed to fetch session data')
        }

        let result: ApiResponse<SessionData>
        try {
          result = await response.json()
        } catch {
          throw new Error('Invalid response')
        }

        if (!result.success || !result.data) {
          setErrorMessage(result.error ?? 'Fehler beim Laden der Sitzung.')
          setLoadingState('error')
          return
        }

        const { session: fetchedSession, stations: fetchedStations, puzzles: fetchedPuzzles } = result.data

        setSession(fetchedSession)
        setStations(fetchedStations)
        setPuzzles(fetchedPuzzles)
        setLoadingState('ready')

        // If session is already completed, redirect to completion page
        if (fetchedSession.status === 'completed') {
          router.push(`/play/${sessionId}/complete`)
        }
      } catch {
        setErrorMessage('Netzwerkfehler. Bitte prüft eure Verbindung.')
        setLoadingState('error')
      }
    }

    fetchSessionData()
  }, [sessionId, setSession, router])

  // Determine current station index from session
  const currentStationIndex = session?.currentStationIndex ?? 0

  // Get puzzles for the current station
  const currentStation = stations[currentStationIndex] ?? null

  const currentStationPuzzles = useMemo(
    () =>
      currentStation
        ? puzzles.filter((p) => {
            // Match puzzles to current station by the station's id
            // Puzzles should have a stationId field linking them
            return (p as Puzzle & { readonly stationId?: string }).stationId === currentStation.id
          })
        : [],
    [puzzles, currentStation],
  )

  // Handle station completion
  const handleStationComplete = useCallback(() => {
    if (!session) return

    const nextIndex = currentStationIndex + 1

    if (nextIndex >= stations.length) {
      // Tour completed
      completeSession(session.totalPoints)
      router.push(`/play/${sessionId}/complete`)
      return
    }

    // Advance to next station
    updateProgress({
      currentStationIndex: nextIndex,
    })
    setActiveView('map')
  }, [session, currentStationIndex, stations.length, completeSession, updateProgress, sessionId, router])

  // Switch to station view when navigating there
  const handleViewChange = useCallback((view: GameView) => {
    setActiveView(view)
  }, [])

  // Loading state
  if (loadingState === 'loading') {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-brass-500 border-t-transparent" />
          <p className="text-sand-300">
            {language === 'de' ? 'Tour wird geladen...' : 'Loading tour...'}
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (loadingState === 'error') {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-b from-navy-950 to-navy-900 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="mb-2 font-display text-xl font-bold text-sand-50">
            {language === 'de' ? 'Fehler' : 'Error'}
          </h2>
          <p className="mb-6 text-sand-300">{errorMessage}</p>
          <button
            onClick={() => router.push('/play')}
            className="rounded-lg bg-brass-500 px-6 py-3 font-semibold text-navy-900 shadow-lg transition-all hover:bg-brass-400 active:scale-95"
          >
            {language === 'de' ? 'Zurück zur Eingabe' : 'Back to Code Entry'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-navy-950">
      {/* Main content area */}
      <div className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          {activeView === 'map' && (
            <motion.div
              key="map-view"
              variants={viewTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-[calc(100vh-3.5rem-4rem)]"
            >
              <MapView
                stations={stations}
                currentStationIndex={currentStationIndex}
                onStationSelect={() => setActiveView('station')}
              />
            </motion.div>
          )}

          {activeView === 'station' && currentStation && (
            <motion.div
              key="station-view"
              variants={viewTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StationView
                station={currentStation}
                puzzles={currentStationPuzzles}
                sessionId={sessionId}
                onComplete={handleStationComplete}
                language={language}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-navy-800 bg-navy-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.view
            const label = language === 'de' ? item.labelDe : item.labelEn

            return (
              <button
                key={item.view}
                onClick={() => handleViewChange(item.view)}
                className={`flex flex-1 flex-col items-center gap-1 px-4 py-3 transition-colors ${
                  isActive
                    ? 'text-brass-400'
                    : 'text-sand-400 hover:text-sand-200'
                }`}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 h-0.5 w-12 bg-brass-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
