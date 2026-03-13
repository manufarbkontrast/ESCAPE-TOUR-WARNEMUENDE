/**
 * PostHog analytics client
 * Initializes only when NEXT_PUBLIC_POSTHOG_KEY is set
 */

import posthog from 'posthog-js'

let initialized = false

export function initPostHog(): void {
  if (initialized) return
  if (typeof window === 'undefined') return

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.posthog.com'

  if (!key) return

  posthog.init(key, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: false, // we capture manually for SPA navigation
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    autocapture: false, // keep payload small, track intentionally
  })

  initialized = true
}

export { posthog }
