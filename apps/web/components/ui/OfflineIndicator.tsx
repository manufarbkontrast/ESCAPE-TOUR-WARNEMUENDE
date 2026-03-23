'use client'

import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'

/**
 * Offline indicator banner.
 *
 * Renders a fixed banner at the top of the viewport when the user
 * loses network connectivity. Uses the `useOnlineStatus` hook to
 * track connectivity and automatically hides when back online.
 *
 * The banner uses a white/sand color scheme consistent with the
 * maritime theme and slides in/out with a CSS animation.
 *
 * @example
 * ```tsx
 * // Add to your root layout or game layout
 * <OfflineIndicator />
 * ```
 */
export function OfflineIndicator() {
 const { isOnline } = useOnlineStatus()

 if (isOnline) {
  return null
 }

 return (
  <div
   role="status"
   aria-live="assertive"
   className="fixed top-0 inset-x-0 z-50 animate-slide-down"
  >
   <div className="flex items-center justify-center gap-2 bg-white/95 px-4 py-2.5 text-sm font-semibold text-dark-950 backdrop-blur-sm">
    <OfflineIcon />
    <span>Ihr seid offline &ndash; Daten werden automatisch synchronisiert</span>
   </div>
  </div>
 )
}

/**
 * Small WiFi-off icon rendered inline as an SVG.
 * Keeps the component self-contained without external icon dependencies.
 */
function OfflineIcon() {
 return (
  <svg
   xmlns="http://www.w3.org/2000/svg"
   width="16"
   height="16"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
   className="shrink-0"
  >
   {/* WiFi arcs */}
   <path d="M1 1l22 22" />
   <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
   <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
   <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
   <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
   <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
   {/* Center dot */}
   <circle cx="12" cy="20" r="1" fill="currentColor" />
  </svg>
 )
}
