'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, posthog } from './posthog'
import { buildPageviewUrl } from './pageview-url'

/**
 * PostHog analytics provider
 * Initializes PostHog and captures page views on route changes
 */
export function PostHogProvider({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (!pathname) return

    // Strips session_id and friends — see pageview-url.ts.
    const url = buildPageviewUrl(pathname, searchParams)

    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return <>{children}</>
}
