/**
 * Tests für die Rollenprüfung des Admin-Bereichs.
 *
 * Bis hierher prüfte `middleware.ts` nur, ob überhaupt jemand eingeloggt ist —
 * jeder registrierte Supabase-Nutzer kam damit auf /dashboard und /buchungen.
 *
 * Entscheidend ist, dass die Rolle aus `app_metadata` kommt und nicht aus
 * `user_metadata`: `user_metadata` darf jeder Nutzer über `auth.updateUser()`
 * selbst schreiben, `app_metadata` nur der service_role-Key. Eine Prüfung auf
 * `user_metadata` wäre also selbst vergebene Admin-Rechte.
 */
import { describe, it, expect } from 'vitest'
import { isAdmin, ADMIN_ROLE } from '@/lib/auth/roles'

describe('ADMIN_ROLE', () => {
  it('should be the value the RLS policy and the migration expect', () => {
    expect(ADMIN_ROLE).toBe('admin')
  })
})

describe('isAdmin', () => {
  it('should reject a missing user', () => {
    expect(isAdmin(null)).toBe(false)
    expect(isAdmin(undefined)).toBe(false)
  })

  it('should reject a signed-in user without any role', () => {
    expect(isAdmin({ app_metadata: {} })).toBe(false)
  })

  it('should reject a user whose app_metadata carries no role key', () => {
    expect(isAdmin({ app_metadata: { provider: 'email' } })).toBe(false)
  })

  it('should accept a user whose app_metadata.role is admin', () => {
    expect(isAdmin({ app_metadata: { role: 'admin' } })).toBe(true)
  })

  it('should reject any other role value', () => {
    expect(isAdmin({ app_metadata: { role: 'user' } })).toBe(false)
    expect(isAdmin({ app_metadata: { role: 'staff' } })).toBe(false)
    expect(isAdmin({ app_metadata: { role: '' } })).toBe(false)
  })

  it('should not accept a role that only differs in case', () => {
    // Die RLS-Policy vergleicht in Postgres exakt. Wäre die Prüfung hier
    // lockerer, käme jemand durch die Middleware und sähe dann trotzdem keine
    // Zeilen — ein Fehlerbild, das schwer zu deuten ist.
    expect(isAdmin({ app_metadata: { role: 'Admin' } })).toBe(false)
    expect(isAdmin({ app_metadata: { role: 'ADMIN' } })).toBe(false)
  })

  it('should ignore a role that the user set on themselves', () => {
    // user_metadata ist über auth.updateUser() vom Client aus schreibbar.
    expect(isAdmin({ user_metadata: { role: 'admin' } })).toBe(false)
    expect(
      isAdmin({ app_metadata: { role: 'user' }, user_metadata: { role: 'admin' } }),
    ).toBe(false)
  })

  it('should survive a role that is not a string', () => {
    expect(isAdmin({ app_metadata: { role: true } })).toBe(false)
    expect(isAdmin({ app_metadata: { role: ['admin'] } })).toBe(false)
    expect(isAdmin({ app_metadata: { role: { name: 'admin' } } })).toBe(false)
  })
})
