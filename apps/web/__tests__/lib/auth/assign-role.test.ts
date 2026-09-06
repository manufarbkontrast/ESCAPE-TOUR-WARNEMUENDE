/**
 * Tests für das Setzen und Entziehen der Admin-Rolle.
 *
 * Die Rolle lebt in `app_metadata`, wo auch Supabase selbst Schlüssel ablegt
 * (`provider`, `providers`). Ein blindes Überschreiben des Objekts würde die
 * verlieren — deshalb wird gemischt, nicht ersetzt.
 *
 * Entzogen wird die Rolle mit `role: null`: die Admin-API von Supabase mischt
 * `app_metadata` in den Bestand, ein Weglassen des Schlüssels ließe die alte
 * Rolle also stehen.
 */
import { describe, it, expect } from 'vitest'
import { withAdminRole, withoutAdminRole } from '@/lib/auth/assign-role'

describe('withAdminRole', () => {
  it('should set the role when there is no metadata yet', () => {
    expect(withAdminRole(null)).toEqual({ role: 'admin' })
    expect(withAdminRole(undefined)).toEqual({ role: 'admin' })
  })

  it('should keep the keys Supabase maintains itself', () => {
    expect(withAdminRole({ provider: 'email', providers: ['email'] })).toEqual({
      provider: 'email',
      providers: ['email'],
      role: 'admin',
    })
  })

  it('should overwrite a different role', () => {
    expect(withAdminRole({ role: 'staff' })).toEqual({ role: 'admin' })
  })

  it('should be idempotent', () => {
    expect(withAdminRole({ role: 'admin' })).toEqual({ role: 'admin' })
  })

  it('should not mutate its input', () => {
    const bestand = { provider: 'email' }

    withAdminRole(bestand)

    expect(bestand).toEqual({ provider: 'email' })
  })
})

describe('withoutAdminRole', () => {
  it('should null the role out rather than dropping the key', () => {
    // Ein weggelassener Schlüssel bliebe beim Mischen unverändert stehen.
    expect(withoutAdminRole({ provider: 'email', role: 'admin' })).toEqual({
      provider: 'email',
      role: null,
    })
  })

  it('should keep the other keys', () => {
    expect(withoutAdminRole({ provider: 'email', providers: ['email'], role: 'admin' })).toEqual({
      provider: 'email',
      providers: ['email'],
      role: null,
    })
  })

  it('should work on metadata that never had a role', () => {
    expect(withoutAdminRole({ provider: 'email' })).toEqual({ provider: 'email', role: null })
    expect(withoutAdminRole(null)).toEqual({ role: null })
  })

  it('should not mutate its input', () => {
    const bestand = { provider: 'email', role: 'admin' }

    withoutAdminRole(bestand)

    expect(bestand).toEqual({ provider: 'email', role: 'admin' })
  })
})

describe('withAdminRole und isAdmin zusammen', () => {
  it('should produce metadata that the gate accepts, and undo it again', async () => {
    const { isAdmin } = await import('@/lib/auth/roles')

    expect(isAdmin({ app_metadata: withAdminRole({ provider: 'email' }) })).toBe(true)
    expect(isAdmin({ app_metadata: withoutAdminRole({ provider: 'email', role: 'admin' }) })).toBe(
      false,
    )
  })
})
