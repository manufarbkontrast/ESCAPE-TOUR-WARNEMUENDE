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
import { StoryIntro } from '@/components/game/StoryIntro'
import { syncSessionProgress } from '@/lib/game/session-sync'

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
 // StoryIntro is shown on every game start — sets the narrative mood.
 // Onboarding (how-to tutorial) is shown only on first ever play.
 const [showStoryIntro, setShowStoryIntro] = useState(true)
 const [showOnboarding, setShowOnboarding] = useState(false)
 const [showNavigationRoute, setShowNavigationRoute] = useState(false)

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
 const handleStationComplete = useCallback(async () => {
  if (!session) return

  const nextIndex = currentStationIndex + 1

  if (nextIndex >= stations.length) {
   completeSession(session.totalPoints)
   // The certificate endpoint requires server-side status='completed'.
   // Wait briefly for the sync, but never strand the player on a flaky
   // connection — the complete page self-heals a missing completion.
   const SYNC_WAIT_LIMIT_MS = 4_000
   const result = await Promise.race([
    syncSessionProgress(sessionId, {
     status: 'completed',
     currentStationIndex: nextIndex,
    }),
    new Promise<{ ok: false; error: string }>((resolve) =>
     setTimeout(
      () => resolve({ ok: false, error: 'Sync timed out' }),
      SYNC_WAIT_LIMIT_MS,
     ),
    ),
   ])
   if (!result.ok) {
    console.error('Session completion sync failed:', result.error)
   }
   router.push(`/play/${sessionId}/complete`)
   return
  }

  updateProgress({
   currentStationIndex: nextIndex,
  })
  setShowNavigationRoute(true)
  setActiveView('map')

  // Persist progress server-side so it survives device switches.
  void syncSessionProgress(sessionId, { currentStationIndex: nextIndex }).then(
   (result) => {
    if (!result.ok) {
     console.error('Station progress sync failed:', result.error)
    }
   },
  )
 }, [session, currentStationIndex, stations.length, completeSession, updateProgress, sessionId, router])

 // Stable callback so MapView doesn't rebuild all markers on every render
 const handleStationSelect = useCallback(() => {
  setShowNavigationRoute(false)
  setActiveView('station')
 }, [])

 // Switch to station view when navigating there
 const handleViewChange = useCallback((view: GameView) => {
  if (view === 'station') {
   setShowNavigationRoute(false)
  }
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

 // Story intro → optional Onboarding → Game.
 // Onboarding only opens if the player has never seen it on this device.
 if (showStoryIntro) {
  return (
   <StoryIntro
    teamName={session?.teamName}
    onComplete={() => {
     setShowStoryIntro(false)
     if (!hasSeenOnboarding()) {
      setShowOnboarding(true)
     }
    }}
   />
  )
 }

 if (showOnboarding) {
  return (
   <Onboarding
    language={language}
    onComplete={() => setShowOnboarding(false)}
   />
  )
 }

 return (
  <div className="relative min-h-[calc(100vh-4rem)] bg-dark-950">
   {/* Map — always rendered, blurred when station is active. Height stops at the
       bottom nav's top edge (4.75rem) so every map overlay (station card, GPS
       button, hints) clears the fixed tab bar instead of hiding behind it. */}
   <div
    className="absolute inset-x-0 top-0 transition-[filter] duration-500"
    style={{
     height: 'calc(100vh - 4rem - 4.75rem)',
     filter: activeView === 'station' ? 'blur(20px) brightness(0.4)' : 'none',
    }}
   >
    <MapView
     stations={stations}
     currentStationIndex={currentStationIndex}
     onStationSelect={handleStationSelect}
     showRoute={showNavigationRoute}
    />
   </div>

   {/* Station overlay — slides in on top of the blurred map */}
   <AnimatePresence>
    {activeView === 'station' && currentStation && (
     <motion.div
      key="station-view"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
      exit={{ opacity: 0, y: 40, transition: { duration: 0.25 } }}
      className="relative z-10 pb-20"
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

   {/* Bottom navigation bar — one slim, integrated bar. The safe-area inset is
       folded into the bar's own bottom padding via max(): on tablets (no home
       indicator, inset = 0) it stays a clean 6 px; phones clear the gesture bar
       without a bulky empty band below the labels. */}
   <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-dark-900/95 backdrop-blur-xl">
    <div
     className="mx-auto flex max-w-md gap-2 px-4 pt-1.5"
     style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
     {NAV_ITEMS.map((item) => {
      const isActive = activeView === item.view
      const label = language === 'de' ? item.labelDe : item.labelEn
      const Icon = item.icon

      return (
       <button
        key={item.view}
        onClick={() => handleViewChange(item.view)}
        className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-colors duration-150 ${
         isActive
          ? 'text-white'
          : 'text-white/50 hover:text-white/70'
        }`}
        style={isActive ? {
         background: 'rgba(255, 255, 255, 0.05)',
        } : undefined}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
       >
        <Icon className="h-6 w-6" strokeWidth={isActive ? 2 : 1.5} />
        <span className="text-xs font-semibold">{label}</span>
       </button>
      )
     })}
    </div>
   </nav>
  </div>
 )
}
