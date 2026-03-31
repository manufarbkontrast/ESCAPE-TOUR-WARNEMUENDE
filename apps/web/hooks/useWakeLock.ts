'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface WakeLockResult {
  readonly isActive: boolean
  readonly isSupported: boolean
}

export function useWakeLock(enabled: boolean): WakeLockResult {
  const [isActive, setIsActive] = useState(false)
  const sentinelRef = useRef<WakeLockSentinel | null>(null)
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator

  const acquire = useCallback(async () => {
    if (!isSupported) return
    try {
      sentinelRef.current = await navigator.wakeLock.request('screen')
      sentinelRef.current.addEventListener('release', () => setIsActive(false))
      setIsActive(true)
    } catch {
      setIsActive(false)
    }
  }, [isSupported])

  const release = useCallback(async () => {
    try {
      await sentinelRef.current?.release()
    } catch {
      // already released
    }
    sentinelRef.current = null
    setIsActive(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      acquire()
    } else {
      release()
    }
    return () => { release() }
  }, [enabled, acquire, release])

  // Re-acquire on visibility change (browsers release on tab hide)
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        acquire()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enabled, acquire])

  return { isActive, isSupported }
}
