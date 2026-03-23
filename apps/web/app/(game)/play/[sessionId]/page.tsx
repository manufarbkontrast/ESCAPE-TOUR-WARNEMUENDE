'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Lightbulb, AlertCircle, ArrowLeft } from 'lucide-react'
import type { Station, Puzzle, GameSession, ApiResponse } from '@escape-tour/shared'
import { useGameStore } from '@/stores/gameStore'
import { MapView } from '@/components/game/MapView'
import { StationView } from '@/components/game/StationView'
import { Onboarding, hasSeenOnboarding } from '@/components/game/Onboarding'

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
  icon: Map,
 },
 {
  view: 'station' as GameView,
  labelDe: 'Station',
  labelEn: 'Station',
  icon: Lightbulb,
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
 const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding())

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
   completeSession(session.totalPoints)
   router.push(`/play/${sessionId}/complete`)
   return
  }

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
   <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center ">
    <div className="text-center">
     <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
     <p className="text-white/60 font-semibold text-sm">
      {language === 'de' ? 'Tour wird geladen...' : 'Loading tour...'}
     </p>
    </div>
   </div>
  )
 }

 // Error state
 if (loadingState === 'error') {
  return (
   <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
    <div className="w-full max-w-md text-center">
     <div className="mx-auto mb-5 btn-icon-lg flex items-center justify-center text-red-400" style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.1)' }}>
      <AlertCircle className="h-6 w-6" strokeWidth={1.5} />
     </div>
     <h2 className="mb-2 text-xl font-bold text-white">
      {language === 'de' ? 'Fehler' : 'Error'}
     </h2>
     <p className="mb-6 text-white/60 font-semibold text-sm">{errorMessage}</p>
     <button
      onClick={() => router.push('/play')}
      className="btn btn-primary"
     >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
      {language === 'de' ? 'Zurück zur Eingabe' : 'Back to Code Entry'}
     </button>
    </div>
   </div>
  )
 }

 // Onboarding overlay — shown once before first game
 if (showOnboarding) {
  return (
   <Onboarding
    language={language}
    onComplete={() => setShowOnboarding(false)}
   />
  )
 }

 return (
  <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-dark-950">
   {/* Main content area */}
   <div className="flex-1 pb-20">
    <AnimatePresence mode="wait">
     {activeView === 'map' && (
      <motion.div
       key="map-view"
       variants={viewTransition}
       initial="initial"
       animate="animate"
       exit="exit"
       className="h-[calc(100vh-4rem-5rem)]"
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
   <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.04] bg-dark-900/90 backdrop-blur-xl">
    <div className="mx-auto flex max-w-lg gap-3 px-4 py-2.5">
     {NAV_ITEMS.map((item) => {
      const isActive = activeView === item.view
      const label = language === 'de' ? item.labelDe : item.labelEn
      const Icon = item.icon

      return (
       <button
        key={item.view}
        onClick={() => handleViewChange(item.view)}
        className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 transition-all duration-150 ${
         isActive
          ? 'text-white'
          : 'text-dark-500 hover:text-white/60'
        }`}
        style={isActive ? {
         background: 'rgba(255, 255, 255, 0.04)',
         boxShadow: '0 0 16px rgba(255, 255, 255, 0.03)',
        } : undefined}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
       >
        <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
        <span className={`text-xs ${isActive ? 'font-semibold' : 'font-semibold'}`}>{label}</span>
       </button>
      )
     })}
    </div>
   </nav>
  </div>
 )
}
