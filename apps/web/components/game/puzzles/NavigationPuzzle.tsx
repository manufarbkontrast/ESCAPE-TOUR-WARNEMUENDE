'use client'

import { useEffect, useMemo } from 'react'
import type { Puzzle } from '@escape-tour/shared'
import { useLocationStore } from '@/stores/locationStore'

interface NavigationPuzzleProps {
  readonly puzzle: Puzzle
  readonly language: 'de' | 'en'
  readonly onSubmit: (answer: { lat: number; lng: number }) => Promise<void>
  readonly isSubmitting: boolean
  readonly isDemo?: boolean
}

const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${Math.round(meters)} m`
}

const calculateDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371e3
  const phi1 = (lat1 * Math.PI) / 180
  const phi2 = (lat2 * Math.PI) / 180
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const calculateBearing = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const phi1 = (lat1 * Math.PI) / 180
  const phi2 = (lat2 * Math.PI) / 180
  const lambda1 = (lng1 * Math.PI) / 180
  const lambda2 = (lng2 * Math.PI) / 180

  const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1)

  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

export function NavigationPuzzle({ puzzle, language, onSubmit, isSubmitting, isDemo = false }: NavigationPuzzleProps) {
  const { userLocation, isTracking, error, startWatching, stopWatching, setLocation } = useLocationStore()
  const target = puzzle.targetLocation
  const radius = puzzle.targetRadiusMeters ?? 20

  useEffect(() => {
    if (isDemo && target) {
      setLocation({
        lat: target.lat,
        lng: target.lng,
        accuracy: 1,
        timestamp: Date.now(),
      })
      return
    }
    startWatching()
    return () => { stopWatching() }
  }, [isDemo, target, setLocation, startWatching, stopWatching])

  const { distance, bearing, isWithinRadius } = useMemo(() => {
    if (!userLocation || !target) {
      return { distance: null, bearing: 0, isWithinRadius: false }
    }

    const dist = calculateDistance(userLocation.lat, userLocation.lng, target.lat, target.lng)
    const bear = calculateBearing(userLocation.lat, userLocation.lng, target.lat, target.lng)

    return { distance: dist, bearing: bear, isWithinRadius: dist <= radius }
  }, [userLocation, target, radius])

  const handleArrival = async () => {
    if (!userLocation) return
    await onSubmit({ lat: userLocation.lat, lng: userLocation.lng })
  }

  const instruction = language === 'de' ? puzzle.instructionDe : (puzzle.instructionEn ?? puzzle.instructionDe)
  const submitLabel = isSubmitting
    ? (language === 'de' ? 'Prüfe...' : 'Checking...')
    : (language === 'de' ? 'Ich bin da!' : "I'm here!")
  const noTargetMessage = language === 'de' ? 'Kein Zielort definiert.' : 'No target location defined.'

  if (!target) {
    return <p className="text-center text-sm text-sand-400">{noTargetMessage}</p>
  }

  return (
    <div className="space-y-5">
      {/* Instruction */}
      {instruction && (
        <div className="flex items-start gap-3 rounded-lg bg-navy-800 p-3">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brass-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-sand-300">{instruction}</p>
        </div>
      )}

      {/* Compass / Direction Indicator */}
      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-brass-500/30 bg-navy-800 p-6">
        {/* Compass Arrow */}
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-brass-500/40 bg-navy-900">
          {userLocation ? (
            <svg
              className="h-16 w-16 text-brass-500 transition-transform duration-300"
              style={{ transform: `rotate(${bearing}deg)` }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l4 10-4-3-4 3 4-10z" />
              <path d="M12 22l-4-10 4 3 4-3-4 10z" opacity={0.3} />
            </svg>
          ) : (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-sand-400 border-t-transparent" />
          )}
        </div>

        {/* Distance Display */}
        {distance !== null ? (
          <div className="text-center">
            <p className={`text-3xl font-bold ${isWithinRadius ? 'text-green-400' : 'text-brass-400'}`}>
              {formatDistance(distance)}
            </p>
            <p className="mt-1 text-sm text-sand-400">
              {isWithinRadius
                ? (language === 'de' ? 'Sie sind am Ziel!' : 'You have arrived!')
                : (language === 'de' ? 'Entfernung zum Ziel' : 'Distance to target')}
            </p>
          </div>
        ) : (
          <p className="text-sm text-sand-400">
            {isTracking
              ? (language === 'de' ? 'Position wird ermittelt...' : 'Getting location...')
              : (language === 'de' ? 'Standort nicht verfügbar' : 'Location unavailable')}
          </p>
        )}

        {/* Accuracy Indicator */}
        {userLocation && (
          <p className="text-xs text-sand-500">
            {language === 'de' ? 'Genauigkeit' : 'Accuracy'}: ~{Math.round(userLocation.accuracy)} m
          </p>
        )}
      </div>

      {/* Location Error */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Demo Mode Indicator */}
      {isDemo && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-center text-sm text-yellow-400">
          {language === 'de' ? 'Demo-Modus: GPS simuliert' : 'Demo mode: GPS simulated'}
        </div>
      )}

      {/* Arrival Button */}
      <button
        onClick={handleArrival}
        disabled={isSubmitting || (!isDemo && (!isWithinRadius || !userLocation))}
        className={`w-full rounded-lg px-6 py-4 font-semibold shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
          isWithinRadius
            ? 'bg-green-500 text-navy-900 hover:bg-green-400'
            : 'bg-brass-500 text-navy-900 hover:bg-brass-400'
        }`}
      >
        {submitLabel}
      </button>
    </div>
  )
}
