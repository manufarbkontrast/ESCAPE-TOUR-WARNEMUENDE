/**
 * Wer darf in den Admin-Bereich.
 *
 * `middleware.ts` und `app/(admin)/layout.tsx` prüften bisher nur, ob
 * überhaupt jemand eingeloggt ist. Jeder registrierte Supabase-Nutzer kam
 * damit auf /dashboard und /buchungen.
 *
 * Die Rolle steht in `app_metadata`, nicht in `user_metadata`: `user_metadata`
 * schreibt der Client über `auth.updateUser()` selbst, `app_metadata` nur der
 * service_role-Key. Dieselbe Stelle liest die RLS-Policy `public.is_admin()`
 * aus dem JWT — Code und Datenbank müssen sich hier einig sein.
 */

/** Rollenwert, auf den Middleware, Layout und RLS-Policy gemeinsam prüfen. */
export const ADMIN_ROLE = 'admin'

/**
 * Minimaler Ausschnitt des Supabase-`User`, den die Prüfung braucht.
 * Absichtlich schmal gehalten, damit die Funktion ohne Auth-Client testbar ist.
 */
export interface RoleBearingUser {
  readonly app_metadata?: Record<string, unknown> | null
  readonly user_metadata?: Record<string, unknown> | null
}

/**
 * True, wenn der Nutzer die Admin-Rolle serverseitig zugewiesen bekommen hat.
 *
 * Setzen lässt sie sich ausschließlich mit dem service_role-Key:
 *   supabase.auth.admin.updateUserById(id, { app_metadata: { role: 'admin' } })
 */
export function isAdmin(user: RoleBearingUser | null | undefined): boolean {
  const role: unknown = user?.app_metadata?.role

  return typeof role === 'string' && role === ADMIN_ROLE
}
