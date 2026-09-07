/**
 * Jede Seite, die `useSearchParams()` benutzt, braucht eine **eigene**
 * Suspense-Grenze.
 *
 * Bis zur Korrektur des Root-Layouts lag über allen Seiten eine gemeinsame
 * Grenze um `{children}`. Sie fing das Aussetzen beim Prerender auf — um den
 * Preis, dass gar kein Server-HTML entstand. Mit dem engeren Layout fällt
 * dieser Auffangnetz weg: eine Seite ohne eigene Grenze reißt jetzt die
 * nächste Grenze darüber mit und bricht beim Prerender.
 *
 * Die Tests rendern jede Seite in einer Aussengrenze mit erkennbarem
 * `fallback`. Taucht dieser Aussen-Fallback im HTML auf, hat die Seite das
 * Aussetzen nach oben durchgereicht — genau der Zustand, der den Build kippt.
 *
 * `useSearchParams()` wirft hier ein nie erfülltes Promise und bildet damit
 * den Ausstieg beim Prerender nach.
 */
import { describe, it, expect, vi } from 'vitest'
import { Suspense } from 'react'
import { renderToString } from 'react-dom/server'

const NIE_ERFUELLT = new Promise<never>(() => {})

vi.mock('next/navigation', () => ({
  useSearchParams: () => {
    throw NIE_ERFUELLT
  },
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

import KontaktPage from '@/app/(marketing)/kontakt/page'
import BuchenPage from '@/app/(marketing)/buchen/page'
import BestaetigungPage from '@/app/(marketing)/buchen/bestaetigung/page'

const AUSSEN_FALLBACK = 'GRENZE-DARUEBER-HAT-AUSGELOEST'

/**
 * Rendert die Seite unterhalb einer Aussengrenze. Der zurückgegebene String
 * enthält `AUSSEN_FALLBACK`, wenn die Seite das Aussetzen nicht selbst
 * aufgefangen hat.
 */
function renderUnterAussengrenze(seite: React.ReactNode): string {
  return renderToString(
    <Suspense fallback={AUSSEN_FALLBACK}>{seite}</Suspense>
  )
}

describe('Suspense-Grenzen der Seiten mit useSearchParams()', () => {
  it('/kontakt fängt das Aussetzen selbst auf', () => {
    const html = renderUnterAussengrenze(<KontaktPage />)

    expect(html).not.toContain(AUSSEN_FALLBACK)
  })

  it('/kontakt rendert seinen statischen Inhalt ins Server-HTML', () => {
    const html = renderUnterAussengrenze(<KontaktPage />)

    expect(html).toContain('So erreicht ihr uns')
  })

  it('/buchen fängt das Aussetzen selbst auf', () => {
    const html = renderUnterAussengrenze(<BuchenPage />)

    expect(html).not.toContain(AUSSEN_FALLBACK)
  })

  it('/buchen/bestaetigung fängt das Aussetzen selbst auf', () => {
    const html = renderUnterAussengrenze(<BestaetigungPage />)

    expect(html).not.toContain(AUSSEN_FALLBACK)
  })
})
