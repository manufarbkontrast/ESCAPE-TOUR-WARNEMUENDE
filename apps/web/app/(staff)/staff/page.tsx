'use client'

import { useState, useCallback, useEffect } from 'react'
import { useStaffStore } from '@/stores/staffStore'
import { StaffDashboard } from '@/components/staff/StaffDashboard'

export default function StaffPage() {
  const { token, isAuthenticated, setToken } = useStaffStore()
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    setAuthed(isAuthenticated())
  }, [token, isAuthenticated])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || pin.length !== 4) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/staff/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error ?? 'Fehler bei der Anmeldung')
        setPin('')
        return
      }

      setToken(data.data.token)
    } catch {
      setError('Verbindungsfehler')
    } finally {
      setIsSubmitting(false)
    }
  }, [pin, isSubmitting, setToken])

  if (authed) {
    return <StaffDashboard />
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Mitarbeiter-Zugang</h1>
        <p className="mt-2 text-sm text-white/50">PIN eingeben um fortzufahren</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex h-14 w-12 items-center justify-center rounded-lg text-2xl font-bold text-white"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${error ? 'rgba(239, 68, 68, 0.4)' : pin.length > i ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {pin.length > i ? '*' : ''}
            </div>
          ))}
        </div>

        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 4)
            setPin(val)
            setError(null)
          }}
          className="sr-only"
          autoFocus
          aria-label="PIN eingeben"
        />

        {/* Number pad for tablets */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, idx) => {
            if (key === null) return <div key={idx} />
            if (key === 'del') {
              return (
                <button
                  key="del"
                  type="button"
                  onClick={() => setPin((p) => p.slice(0, -1))}
                  className="flex h-12 items-center justify-center rounded-lg text-sm text-white/50 transition-colors hover:bg-white/5"
                >
                  Löschen
                </button>
              )
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (pin.length < 4) {
                    setPin((p) => p + key)
                    setError(null)
                  }
                }}
                className="flex h-12 items-center justify-center rounded-lg text-lg font-semibold text-white transition-colors hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {key}
              </button>
            )
          })}
        </div>

        {error && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || pin.length !== 4}
          className="btn btn-primary w-full py-3 text-base"
        >
          {isSubmitting ? 'Wird geprüft...' : 'Anmelden'}
        </button>
      </form>
    </div>
  )
}
