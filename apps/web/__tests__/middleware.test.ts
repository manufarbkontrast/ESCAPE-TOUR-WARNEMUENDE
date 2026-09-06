/**
 * Tests für den Zugriffsschutz der Admin-Routen.
 *
 * Die Middleware prüfte bisher nur „eingeloggt oder nicht". Wer sich über
 * Supabase Auth irgendein Konto anlegte, erreichte damit /dashboard und
 * /buchungen — inklusive Kontaktdaten und Umsätzen aller Buchungen.
 *
 * `updateSession` wird gemockt: es braucht sonst Umgebungsvariablen und einen
 * echten Auth-Roundtrip. Geprüft wird hier ausschließlich die Entscheidung,
 * die die Middleware aus dem zurückgegebenen Nutzer ableitet.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const { mockUpdateSession } = vi.hoisted(() => ({
  mockUpdateSession: vi.fn(),
}))

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: mockUpdateSession,
}))

import { middleware } from '@/middleware'

/** Baut die Antwort, die `updateSession` im Erfolgsfall liefert. */
function sessionFor(user: unknown) {
  return { supabaseResponse: NextResponse.next(), user }
}

const ADMIN = { id: 'u-1', email: 'chef@example.de', app_metadata: { role: 'admin' } }
const GAST_MIT_KONTO = { id: 'u-2', email: 'gast@example.de', app_metadata: {} }

function requestFor(pathname: string) {
  return new NextRequest(new URL(pathname, 'https://escape-tour-warnemuende.de'))
}

/** Ziel eines Redirects, oder null wenn die Antwort durchlässt. */
function redirectTarget(response: Response): string | null {
  if (response.status < 300 || response.status >= 400) return null
  const location = response.headers.get('location')
  return location ? new URL(location).pathname + new URL(location).search : null
}

beforeEach(() => {
  mockUpdateSession.mockReset()
})

describe('middleware — Admin-Routen', () => {
  const adminRoutes = ['/dashboard', '/dashboard/analytics', '/buchungen']

  it.each(adminRoutes)('should send an anonymous visitor of %s to the login page', async (route) => {
    mockUpdateSession.mockResolvedValue(sessionFor(null))

    const target = redirectTarget(await middleware(requestFor(route)))

    expect(target).toBe(`/login?redirect=${encodeURIComponent(route)}`)
  })

  it.each(adminRoutes)('should turn away a signed-in user without the admin role at %s', async (route) => {
    mockUpdateSession.mockResolvedValue(sessionFor(GAST_MIT_KONTO))

    const target = redirectTarget(await middleware(requestFor(route)))

    // Nicht /login: der Nutzer ist eingeloggt, ein Login-Redirect liefe im Kreis.
    expect(target).toBe('/')
  })

  it.each(adminRoutes)('should let an admin through to %s', async (route) => {
    mockUpdateSession.mockResolvedValue(sessionFor(ADMIN))

    const response = await middleware(requestFor(route))

    expect(redirectTarget(response)).toBeNull()
  })

  it('should not accept a role the user set on themselves', async () => {
    mockUpdateSession.mockResolvedValue(
      sessionFor({ id: 'u-3', app_metadata: {}, user_metadata: { role: 'admin' } }),
    )

    expect(redirectTarget(await middleware(requestFor('/dashboard')))).toBe('/')
  })
})

describe('middleware — öffentliche Routen', () => {
  const publicRoutes = ['/', '/preise', '/kontakt', '/spiel/ABC123', '/login']

  it.each(publicRoutes)('should leave %s alone for an anonymous visitor', async (route) => {
    mockUpdateSession.mockResolvedValue(sessionFor(null))

    expect(redirectTarget(await middleware(requestFor(route)))).toBeNull()
  })

  it.each(publicRoutes)('should leave %s alone for a signed-in non-admin', async (route) => {
    mockUpdateSession.mockResolvedValue(sessionFor(GAST_MIT_KONTO))

    expect(redirectTarget(await middleware(requestFor(route)))).toBeNull()
  })
})
