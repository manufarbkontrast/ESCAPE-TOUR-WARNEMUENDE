-- ---------------------------------------------------------------------------
-- Entzieht dem öffentlichen Anon-Key den Lesezugriff auf Spielgeheimnisse und
-- macht die Buchungsanlage auf DB-Ebene idempotent.
--
-- Stand vor dieser Migration (am 2026-09-06 gegen die Produktions-DB geprüft):
--
--   set local role anon;
--   select count(*) from puzzles;  -- 36  ← inklusive Spalte correct_answer
--   select count(*) from hints;    -- 84  ← inklusive Lösungshinweise
--
-- Der Anon-Key steht im Client-Bundle. Ein einzelner Request genügte also, um
-- sämtliche Rätsellösungen abzuziehen; die serverseitige Antwortprüfung und
-- das Hinweis-Punktesystem waren damit wertlos.
--
-- Warum das Entfernen gefahrlos ist:
--   * Kein Browser-Code spricht direkt mit Supabase (verifiziert per Grep über
--     app/, components/, lib/, stores/ — keine Verwendung von
--     lib/supabase/client.ts).
--   * Alle Route-Handler laufen seit lib/supabase/admin.ts als service_role.
--   * service_role hat rolbypassrls = true, wird von RLS-Policies also gar
--     nicht berührt (geprüft in pg_roles).
--
-- ANWENDEN: Supabase-Dashboard -> SQL Editor, oder
--           supabase db push  (bei verlinktem Projekt)
-- ---------------------------------------------------------------------------

begin;

-- ---------------------------------------------------------------------------
-- 1. Rätsel: kein öffentlicher Lesezugriff mehr
-- ---------------------------------------------------------------------------
-- RLS in Postgres wirkt zeilen-, nicht spaltenweise. Die Spalte
-- correct_answer lässt sich also nicht einzeln ausblenden, ohne dass ein
-- `select=*` des Clients mit "permission denied" bricht. Da niemand mehr als
-- anon lesen muss, entfällt die Policy vollständig.
drop policy if exists "Public can view puzzles of active tours" on public.puzzles;

-- ---------------------------------------------------------------------------
-- 2. Hinweise: kein öffentlicher Lesezugriff mehr
-- ---------------------------------------------------------------------------
-- Hinweisstufe 3 ist in der Regel die Lösung. Ausgeliefert werden Hinweise
-- ausschließlich über GET /api/game/hints/[puzzleId], das die Session prüft.
drop policy if exists "Public can view hints of active tours" on public.hints;

-- ---------------------------------------------------------------------------
-- 3. Zertifikate: "USING (true)" für anon entfernen
-- ---------------------------------------------------------------------------
-- Die bestehende Policy erlaubte jedem das Lesen aller Zertifikate samt
-- Teamnamen. Eine öffentliche Verifikationsseite existiert nicht — der
-- Verifikationscode wird nur auf der Abschlussseite angezeigt, die ihre Daten
-- über /api/game/certificate bezieht.
--
-- Falls später eine öffentliche Prüfseite entsteht, gehört sie hinter eine
-- Policy, die nach verification_code filtert, nicht hinter USING (true).
drop policy if exists "certificates_verify_by_code" on public.certificates;

-- ---------------------------------------------------------------------------
-- 4. Doppelte Buchungen aus Stripe-Wiederholungen ausschließen
-- ---------------------------------------------------------------------------
-- Stripe stellt Webhooks mindestens einmal zu. Der Webhook prüft seit dieser
-- Änderung vor dem Anlegen auf eine vorhandene payment_intent_id, aber zwei
-- gleichzeitig zugestellte Wiederholungen können diese Prüfung überholen.
-- Der Index macht das auf DB-Ebene unmöglich.
--
-- Partiell (where ... is not null), damit manuell angelegte Buchungen ohne
-- Stripe-Zahlung weiterhin möglich bleiben — in Postgres wären mehrere NULLs
-- zwar ohnehin erlaubt, der Filter macht die Absicht aber explizit.
create unique index if not exists bookings_payment_intent_id_key
  on public.bookings (payment_intent_id)
  where payment_intent_id is not null;

commit;

-- ---------------------------------------------------------------------------
-- Kontrolle nach dem Anwenden — beide Zeilen müssen 0 ergeben
-- ---------------------------------------------------------------------------
-- set local role anon;
-- select count(*) as puzzles_fuer_anon from public.puzzles;
-- select count(*) as hints_fuer_anon   from public.hints;
--
-- Gegenprobe, dass die App weiterhin liest (service_role umgeht RLS):
-- curl "$SUPABASE_URL/rest/v1/puzzles?select=id&limit=1" \
--   -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
--   -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

-- ---------------------------------------------------------------------------
-- Rollback (exakt die Policies, die vorher aktiv waren)
-- ---------------------------------------------------------------------------
-- create policy "Public can view puzzles of active tours" on public.puzzles
--   for select using (
--     exists (
--       select 1 from stations s
--       join tours t on s.tour_id = t.id
--       where s.id = puzzles.station_id and t.is_active = true
--     )
--   );
--
-- create policy "Public can view hints of active tours" on public.hints
--   for select using (
--     exists (
--       select 1 from puzzles p
--       join stations s on p.station_id = s.id
--       join tours t on s.tour_id = t.id
--       where p.id = hints.puzzle_id and t.is_active = true
--     )
--   );
--
-- create policy "certificates_verify_by_code" on public.certificates
--   for select to anon, authenticated using (true);
--
-- drop index if exists public.bookings_payment_intent_id_key;

-- ---------------------------------------------------------------------------
-- Bewusst NICHT Teil dieser Migration
-- ---------------------------------------------------------------------------
-- a) stations und tours bleiben öffentlich lesbar. Beide enthalten keine
--    Geheimnisse (Namen, Koordinaten, Story-Texte), und der kleinere Eingriff
--    lässt sich leichter beurteilen. Wer auch das Abgreifen der Tourinhalte
--    verhindern will, kann analog verfahren:
--      drop policy if exists "Public can view stations of active tours" on public.stations;
--      drop policy if exists "Public can view active tours" on public.tours;
--
-- b) Das Admin-Dashboard bleibt kaputt. Die Policy auf bookings lautet
--    "auth.uid() = user_id", während vom Stripe-Webhook angelegte Buchungen
--    user_id = NULL haben — ein eingeloggter Admin sieht also nichts.
--    Die Lösung braucht ein Rollenkonzept (app_metadata.role = 'admin')
--    zusammen mit einer Prüfung in middleware.ts, die aktuell nur auf
--    "irgendein eingeloggter Nutzer" testet. Das ist eine eigene Änderung.
