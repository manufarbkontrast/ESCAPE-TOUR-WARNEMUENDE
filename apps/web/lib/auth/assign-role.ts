/**
 * Admin-Rolle vergeben und entziehen.
 *
 * Gegenstück zu `isAdmin` in lib/auth/roles.ts: hier wird der Wert gesetzt,
 * den Middleware, Admin-Layout und die RLS-Policy `public.is_admin()` lesen.
 *
 * Beide Funktionen liefern ein neues Objekt und lassen den Bestand
 * unangetastet. Geschrieben wird das Ergebnis ausschließlich mit dem
 * service_role-Key über `auth.admin.updateUserById` — siehe
 * scripts/set-admin-role.ts.
 */

import { ADMIN_ROLE } from './roles'

/** Was Supabase in `app_metadata` ablegt, plus unsere Rolle. */
export type AppMetadata = Readonly<Record<string, unknown>>

/**
 * `app_metadata` mit gesetzter Admin-Rolle.
 *
 * Gemischt statt ersetzt: Supabase pflegt in demselben Objekt `provider` und
 * `providers`, die beim Überschreiben verloren gingen.
 */
export function withAdminRole(current: AppMetadata | null | undefined): Record<string, unknown> {
  return { ...(current ?? {}), role: ADMIN_ROLE }
}

/**
 * `app_metadata` ohne Admin-Rolle.
 *
 * `role: null` statt eines weggelassenen Schlüssels: die Admin-API mischt das
 * übergebene Objekt in den Bestand, ein Weglassen ließe die Rolle stehen.
 */
export function withoutAdminRole(
  current: AppMetadata | null | undefined,
): Record<string, unknown> {
  return { ...(current ?? {}), role: null }
}
