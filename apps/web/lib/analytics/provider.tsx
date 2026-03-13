'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, posthog } from './posthog'

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

    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname

    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return <>{children}</>
}
