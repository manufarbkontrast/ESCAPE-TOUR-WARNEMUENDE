'use client'

import { useState, useEffect, useCallback } from 'react'

interface OnlineStatus {
  /** Whether the browser currently has network connectivity */
  readonly isOnline: boolean
  /** Whether the user was offline at any point during this session and has since reconnected */
  readonly wasOffline: boolean
  /** Reset the wasOffline flag (e.g. after showing a reconnection message) */
  readonly resetWasOffline: () => void
}

/**
 * Tracks browser online/offline status with reconnection awareness.
 *
 * Returns the current connectivity state and whether the user
 * experienced a disconnection during the session. This is useful
 * for showing "back online" messages or triggering data sync.
 *
 * @example
 * ```tsx
 * const { isOnline, wasOffline, resetWasOffline } = useOnlineStatus()
 *
 * if (!isOnline) {
 *   return <OfflineBanner />
 * }
 *
 * if (wasOffline) {
 *   syncData().then(resetWasOffline)
 * }
 * ```
 */
export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  const resetWasOffline = useCallback(() => {
    setWasOffline(false)
  }, [])

  useEffect(() => {
    // Initialize with the actual browser state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      // Mark that we recovered from an offline period
      setWasOffline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, wasOffline, resetWasOffline }
}
