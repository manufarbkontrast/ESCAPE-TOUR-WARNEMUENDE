'use client'

import { useState, useEffect } from 'react'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { offlineSync } from '@/lib/offline/sync-manager'

export function OfflineIndicator() {
 const { isOnline, wasOffline, resetWasOffline } = useOnlineStatus()
 const [pendingCount, setPendingCount] = useState(0)
 const [showReconnected, setShowReconnected] = useState(false)

 // Track pending actions
 useEffect(() => {
  if (!isOnline) {
   const interval = setInterval(async () => {
    const count = await offlineSync.getPendingCount()
    setPendingCount(count)
   }, 2000)
   return () => clearInterval(interval)
  }
  setPendingCount(0)
 }, [isOnline])

 // Show "back online" briefly after reconnect
 useEffect(() => {
  if (wasOffline && isOnline) {
   setShowReconnected(true)
   const timer = setTimeout(() => {
    setShowReconnected(false)
    resetWasOffline()
   }, 3000)
   return () => clearTimeout(timer)
  }
 }, [wasOffline, isOnline, resetWasOffline])

 if (isOnline && !showReconnected) return null

 return (
  <div
   role="status"
   aria-live="assertive"
   className="fixed top-0 inset-x-0 z-50 animate-slide-down"
  >
   {showReconnected ? (
    <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white"
     style={{ background: 'rgba(34, 197, 94, 0.9)', backdropFilter: 'blur(8px)' }}>
     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M20 6 9 17l-5-5" />
     </svg>
     <span>Wieder online — Daten werden synchronisiert</span>
    </div>
   ) : (
    <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-dark-950"
     style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }}>
     <OfflineIcon />
     <span>
      Offline{pendingCount > 0 ? ` — ${pendingCount} Aktion${pendingCount > 1 ? 'en' : ''} warten` : ' — Daten werden lokal gespeichert'}
     </span>
    </div>
   )}
  </div>
 )
}

function OfflineIcon() {
 return (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
   <path d="M1 1l22 22" />
   <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
   <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
   <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
   <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
   <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
   <circle cx="12" cy="20" r="1" fill="currentColor" />
  </svg>
 )
}
