/**
 * Tests dafür, dass die Seiten serverseitiges HTML liefern.
 *
 * Hintergrund: `useSearchParams()` steigt beim statischen Prerender aus dem
 * Server-Rendering aus — React behandelt das wie ein `Suspense`-Aussetzen und
 * rendert für die nächste umschließende Grenze deren `fallback`. Lag diese
 * Grenze im Root-Layout **um `{children}` herum**, fiel damit die komplette
 * Seite aus dem HTML und Google bekam einen leeren `<body>`.
 *
 * Die Tests bilden das Aussetzen nach, indem `useSearchParams()` ein nie
 * erfülltes Promise wirft — genau der Mechanismus, den Next dort benutzt.
 * `renderToString` kann Suspense serverseitig nicht auflösen und lässt die
 * betroffene Grenze als Platzhalter zurück; alles außerhalb bleibt erhalten.
 * Damit prüft der Test genau das, worauf es ankommt: **liegt der Inhalt
 * innerhalb oder außerhalb der Analytics-Grenze.** Steht er im HTML, sitzt
 * die Grenze eng genug.
 */
import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

const NIE_ERFUELLT = new Promise<never>(() => {})

vi.mock('next/navigation', () => ({
  // Bildet den Ausstieg beim Prerender nach, siehe Dateikopf.
  useSearchParams: () => {
    throw NIE_ERFUELLT
  },
  usePathname: () => '/',
}))

vi.mock('next/font/google', () => {
  const font = () => ({ variable: '--font-stub', className: 'font-stub' })
  return { Inter: font, JetBrains_Mono: font, Playfair_Display: font }
})

vi.mock('@/lib/analytics/posthog', () => ({
  initPostHog: vi.fn(),
  posthog: { capture: vi.fn() },
}))

vi.mock('@/components/CookieConsent', () => ({
  CookieConsent: () => null,
}))

import RootLayout from '@/app/layout'

/** Rendert das Layout serverseitig und liefert das erzeugte HTML. */
function renderLayoutToHtml(children: React.ReactNode): string {
  return renderToString(<RootLayout>{children}</RootLayout>)
}

describe('Root-Layout', () => {
  it('rendert den Seiteninhalt ins Server-HTML, obwohl Analytics aussetzt', () => {
    const html = renderLayoutToHtml(
      <main>
        <h1>Escape Tour Warnemünde</h1>
      </main>
    )

    expect(html).toContain('<h1')
    expect(html).toContain('Escape Tour Warnemünde')
  })
})
