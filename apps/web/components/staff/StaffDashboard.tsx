'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffStore } from '@/stores/staffStore'
import { resetDevice } from '@/lib/utils/reset-device'

type TourType = 'adult' | 'family'

const TOUR_OPTIONS: readonly { type: TourType; label: string; desc: string }[] = [
  { type: 'adult', label: 'Erwachsenen-Tour', desc: '12 Stationen, ca. 120 Min' },
  { type: 'family', label: 'Familien-Tour', desc: '12 Stationen, ca. 90 Min' },
]

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export function StaffDashboard() {
  const router = useRouter()
  const { token, recentSessions, clearToken, addRecentSession } = useStaffStore()
  const [selectedTour, setSelectedTour] = useState<TourType>('adult')
  const [isCreating, setIsCreating] = useState(false)
  const [lastSessionId, setLastSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateSession = useCallback(async () => {
    if (isCreating) return
    setIsCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/staff/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourType: selectedTour, staffToken: token }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error ?? 'Fehler beim Erstellen')
        return
      }

      const sessionId = data.data.sessionId as string
      setLastSessionId(sessionId)
      addRecentSession({
        id: sessionId,
        tourType: selectedTour,
        createdAt: new Date().toISOString(),
      })
    } catch {
      setError('Verbindungsfehler')
    } finally {
      setIsCreating(false)
    }
  }, [isCreating, selectedTour, token, addRecentSession])

  const handleAssignToTablet = useCallback(() => {
    if (lastSessionId) {
      router.push(`/play/${lastSessionId}`)
    }
  }, [lastSessionId, router])

  const handleReset = useCallback(() => {
    if (window.confirm('Gerät zurücksetzen? Alle Daten werden gelöscht.')) {
      resetDevice({ preserveStaffToken: true })
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Escape Tour</h1>
          <p className="text-sm text-white/50">Mitarbeiter-Modus</p>
        </div>
        <button
          onClick={() => clearToken()}
          className="rounded-lg px-3 py-1.5 text-sm text-white/50 transition-colors hover:text-white"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Abmelden
        </button>
      </div>

      {/* Tour Selection */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-white/60">Tour auswählen</h2>
        <div className="grid grid-cols-2 gap-2">
          {TOUR_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => setSelectedTour(opt.type)}
              className="rounded-lg p-3 text-left transition-all"
              style={{
                background: selectedTour === opt.type ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedTour === opt.type ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <p className="text-sm font-semibold text-white">{opt.label}</p>
              <p className="mt-0.5 text-xs text-white/50">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Create Session */}
      <button
        onClick={handleCreateSession}
        disabled={isCreating}
        className="btn btn-primary w-full py-3 text-base"
      >
        {isCreating ? 'Wird erstellt...' : 'Neue Session starten'}
      </button>

      {error && (
        <p className="text-center text-sm text-red-400">{error}</p>
      )}

      {/* Session Created */}
      {lastSessionId && (
        <div className="card-glass p-4 space-y-3">
          <p className="text-xs text-white/50">Session erstellt</p>
          <p className="font-mono text-sm text-white/80 break-all">{lastSessionId}</p>
          <button
            onClick={handleAssignToTablet}
            className="btn btn-primary w-full py-3 text-base"
          >
            Session dem Tablet zuweisen
          </button>
        </div>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-white/60">Letzte Sessions</h2>
          <div className="space-y-1">
            {recentSessions.map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(`/play/${s.id}`)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-sm text-white/70">{s.tourType === 'adult' ? 'Erwachsene' : 'Familie'}</p>
                  <p className="font-mono text-xs text-white/50">{s.id.slice(0, 24)}...</p>
                </div>
                <p className="text-xs text-white/50">{formatTime(s.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <div className="border-t border-white/5 pt-4">
        <button
          onClick={handleReset}
          className="w-full rounded-lg py-2 text-sm text-white/50 transition-colors hover:text-white/70"
        >
          Gerät zurücksetzen
        </button>
      </div>
    </div>
  )
}
