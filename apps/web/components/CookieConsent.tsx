'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { posthog } from '@/lib/analytics/posthog'

const CONSENT_KEY = 'cookie-consent' as const

type ConsentValue = 'accepted' | 'rejected'

function getStoredConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(CONSENT_KEY)
  if (stored === 'accepted' || stored === 'rejected') return stored
  return null
}

function setStoredConsent(value: ConsentValue): void {
  localStorage.setItem(CONSENT_KEY, value)
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const consent = getStoredConsent()
    if (consent === null) {
      setVisible(true)
    }
  }, [])

  const dismiss = useCallback((value: ConsentValue) => {
    setExiting(true)
    setTimeout(() => {
      setStoredConsent(value)
      setVisible(false)
      setExiting(false)
    }, 150)

    try {
      if (value === 'accepted') {
        posthog.opt_in_capturing()
      } else {
        posthog.opt_out_capturing()
      }
    } catch {
      // PostHog not initialized
    }
  }, [])

  const handleAccept = useCallback(() => dismiss('accepted'), [dismiss])
  const handleReject = useCallback(() => dismiss('rejected'), [dismiss])

  useEffect(() => {
    if (!visible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleReject()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visible, handleReject])

  if (!visible) return null

  return (
    <div
      ref={bannerRef}
      className={`
        fixed bottom-0 left-0 right-0 z-50 p-4
        transition-all duration-150 ease-out
        ${exiting ? 'translate-y-full opacity-0' : 'animate-slide-up'}
      `}
      role="dialog"
      aria-label="Cookie-Einstellungen"
    >
      <div
        className="mx-auto max-w-lg rounded-lg p-4 sm:p-5"
        style={{
          background: 'rgba(10, 10, 10, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 -1px 4px rgba(0, 0, 0, 0.15)',
        }}
      >
        <p className="text-sm leading-relaxed text-dark-300">
          Diese Website verwendet Cookies zur Analyse und Verbesserung.
          Details in unserer{' '}
          <a
            href="/datenschutz"
            className="text-white underline underline-offset-2 transition-colors duration-150 hover:text-dark-200"
          >
            Datenschutzerkl&auml;rung
          </a>
          .
        </p>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-dark-950 transition-colors duration-150 hover:bg-dark-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
          >
            Akzeptieren
          </button>
          <button
            onClick={handleReject}
            className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-dark-300 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            Nur notwendige
          </button>
        </div>
      </div>
    </div>
  )
}
