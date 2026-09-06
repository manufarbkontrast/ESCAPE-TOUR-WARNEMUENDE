/**
 * Tests für das Auth-Gate des Admin-Layouts.
 *
 * Die Middleware ist die erste Schicht, aber sie hängt an einem Matcher-Regex
 * und läuft nicht bei jedem Rendering-Pfad. Das Layout ist die Stelle, die
 * jede Seite unter app/(admin) zwingend passiert — also prüft es die Rolle
 * noch einmal selbst, mit demselben `isAdmin` wie die Middleware und dieselbe
 * Quelle wie die RLS-Policy.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockRedirect, mockGetUser } = vi.hoisted(() => ({
  mockRedirect: vi.fn((path: string) => {
    // Das echte `redirect()` bricht das Rendering per throw ab. Ohne dieses
    // Verhalten liefe das Layout weiter und der Test übersähe, dass die
    // geschützte Seite trotzdem gerendert wird.
    throw new Error(`NEXT_REDIRECT:${path}`)
  }),
  mockGetUser: vi.fn(),
}))

vi.mock('next/navigation', () => ({ redirect: mockRedirect }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mockGetUser } })),
}))

import AdminLayout from '@/app/(admin)/layout'

const ADMIN = { id: 'u-1', email: 'chef@example.de', app_metadata: { role: 'admin' } }
const GAST_MIT_KONTO = { id: 'u-2', email: 'gast@example.de', app_metadata: {} }

/** Ruft das Layout auf und liefert das Redirect-Ziel, oder null. */
async function renderLayout(): Promise<string | null> {
  try {
    await AdminLayout({ children: null })
    return null
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.startsWith('NEXT_REDIRECT:')) return message.slice('NEXT_REDIRECT:'.length)
    throw error
  }
}

beforeEach(() => {
  mockRedirect.mockClear()
  mockGetUser.mockReset()
})

describe('AdminLayout', () => {
  it('should send an anonymous visitor to the login page', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    expect(await renderLayout()).toBe('/login')
  })

  it('should turn away a signed-in user without the admin role', async () => {
    mockGetUser.mockResolvedValue({ data: { user: GAST_MIT_KONTO } })

    expect(await renderLayout()).toBe('/')
  })

  it('should ignore a role the user set on themselves', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u-3', app_metadata: {}, user_metadata: { role: 'admin' } } },
    })

    expect(await renderLayout()).toBe('/')
  })

  it('should render the shell for an admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: ADMIN } })

    expect(await renderLayout()).toBeNull()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
