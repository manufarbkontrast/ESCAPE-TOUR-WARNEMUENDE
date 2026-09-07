'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, posthog } from './posthog'
import { buildPageviewUrl } from './pageview-url'

/**
 * PostHog analytics provider
 * Initializes PostHog and captures page views on route changes
 *
 * Rendert bewusst **nichts** und umschließt bewusst **keine** Kinder:
 * `useSearchParams()` steigt beim Prerender aus dem Server-Rendering aus, und
 * alles innerhalb derselben Suspense-Grenze fällt damit aus dem HTML. Wer hier
 * wieder `children` einführt, nimmt der ganzen Seite das SSR — siehe
 * `app/layout.tsx` und `__tests__/app/layout.test.tsx`.
 */
export function PostHogProvider() {
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

  return null
}
