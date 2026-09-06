-- ---------------------------------------------------------------------------
-- Gibt dem Admin-Dashboard Lesezugriff auf Buchungen und Spielsessions.
--
-- Stand vor dieser Migration (am 2026-09-06 gegen die Produktions-DB geprüft):
--
--   bookings      "Users can view own bookings"   using (auth.uid() = user_id)
--   game_sessions "Session access by booking owner" ... bookings.user_id = auth.uid()
--
-- Buchungen legt der Stripe-Webhook als service_role an; die haben
-- user_id = NULL, weil Gäste sich nie einloggen. Ein eingeloggter Admin sah
-- über den Cookie-Client deshalb null Zeilen — /dashboard und /buchungen
-- zeigten dauerhaft „Noch keine Buchungen vorhanden", obwohl welche da waren.
--
-- Die Lösung ist das Rollenkonzept, das die Migration
-- 20260906120000 unter „Bewusst NICHT Teil dieser Migration" angekündigt hat.
--
-- Warum app_metadata und nicht user_metadata:
--   user_metadata schreibt der Client selbst über auth.updateUser() — eine
--   Policy dagegen wäre selbst vergebene Admin-Rechte. app_metadata ist nur
--   mit dem service_role-Key setzbar.
--
-- Warum eine zusätzliche Policy statt einer geänderten:
--   Postgres verodert Policies desselben Kommandos. Die bestehende
--   Eigentümer-Policy bleibt damit unangetastet und weiter einzeln lesbar.
--
-- Gegenstück im Code: apps/web/lib/auth/roles.ts (isAdmin), middleware.ts und
-- app/(admin)/layout.tsx prüfen denselben Wert. Ändert sich einer, müssen alle
-- vier mit.
--
-- NACH DEM ANWENDEN: mindestens ein Konto braucht die Rolle, sonst bleibt das
-- Dashboard leer. Mit dem service_role-Key:
--   supabase.auth.admin.updateUserById(<id>, { app_metadata: { role: 'admin' } })
--
-- STATUS: am 2026-09-06 auf die Produktions-DB angewendet und verifiziert
--         (pg_policies zeigt beide Policies, qual = is_admin()).
--         Verbucht in supabase_migrations.schema_migrations als 20260906170600 —
--         daher der Dateiname, obwohl sie nach 20260906120000 entstanden ist.
-- ---------------------------------------------------------------------------

begin;

-- ---------------------------------------------------------------------------
-- 1. Rollenprüfung als benannte Funktion
-- ---------------------------------------------------------------------------
-- Liest die Rolle aus dem JWT des Requests. `stable` statt `immutable`, weil
-- das Ergebnis vom aktuellen Request abhängt. `security invoker` und ein
-- leerer search_path, damit die Funktion keine Rechte verleiht und nicht über
-- ein untergeschobenes Schema umgeleitet werden kann.

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

comment on function public.is_admin() is
  'True, wenn das JWT des Requests app_metadata.role = admin trägt. '
  'Gegenstück zu apps/web/lib/auth/roles.ts.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Buchungen: Admins sehen alle
-- ---------------------------------------------------------------------------
-- Nur SELECT. Das Dashboard zeigt an und ändert nichts (verifiziert in
-- app/(admin)/buchungen/bookings-table.tsx). Schreibrechte kommen erst, wenn
-- es eine Oberfläche gibt, die sie braucht.

drop policy if exists "Admins can view all bookings" on public.bookings;

create policy "Admins can view all bookings" on public.bookings
  for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Spielsessions: Admins sehen alle
-- ---------------------------------------------------------------------------
-- /dashboard zählt darüber die aktiven Spiele.

drop policy if exists "Admins can view all sessions" on public.game_sessions;

create policy "Admins can view all sessions" on public.game_sessions
  for select to authenticated
  using (public.is_admin());

commit;
