'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Anchor, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@escape-tour/database/src/types/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError('')

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('Ungültige Zugangsdaten')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    },
    [email, password, supabase, router],
  )

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-navy-950 to-navy-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <Anchor className="h-7 w-7 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-2xl font-bold text-sand-50">Admin</h1>
          <p className="text-sm text-sand-500 mt-1">Escape Tour Warnemünde</p>
        </div>

        <form onSubmit={handleLogin} className="card p-6 space-y-4">
          {error && (
            <div
              className="rounded-xl p-3 flex items-center gap-2"
              style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.12)',
              }}
            >
              <AlertCircle className="h-4 w-4 text-red-400/80 flex-shrink-0" strokeWidth={1.5} />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-xs font-medium text-sand-400 mb-2">
              E-Mail
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm text-sand-200 placeholder:text-sand-600 focus:outline-none focus:ring-1 focus:ring-white/20"
              style={inputStyle}
              placeholder="admin@escape-tour.de"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-medium text-sand-400 mb-2">
              Passwort
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm text-sand-200 placeholder:text-sand-600 focus:outline-none focus:ring-1 focus:ring-white/20"
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy-950 border-t-transparent" />
                Anmelden...
              </>
            ) : (
              'Anmelden'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
