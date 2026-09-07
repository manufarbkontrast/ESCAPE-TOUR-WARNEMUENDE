-- ---------------------------------------------------------------------------
-- Erlebnisgutscheine.
--
-- Ein Gutschein kauft eine konkrete Tour für eine konkrete Personenzahl
-- ("Familien-Tour für 2 Personen"); den Termin wählt der Beschenkte später.
--
-- Warum eine eigene Tabelle und nicht einfach eine Buchung ohne Datum:
-- bookings.scheduled_date ist NOT NULL. Das aufzuweichen würde die Bedeutung
-- der Buchungstabelle für alles andere verwässern — jede Auswertung müsste ab
-- dann terminlose Zeilen mitdenken.
--
-- Beim Einlösen entsteht eine ganz normale Buchung; der Gutschein merkt sich
-- über redeemed_booking_id, welche.
--
-- ANWENDEN: Supabase-Dashboard -> SQL Editor, oder supabase db push
-- ---------------------------------------------------------------------------

begin;

create table if not exists public.vouchers (
  id                  uuid primary key default uuid_generate_v4(),

  -- Format GS-XXXX-XXXX, siehe lib/vouchers/voucher.ts. Bewusst anders als der
  -- sechsstellige Buchungscode, damit im Support sofort klar ist, was jemand
  -- in der Hand hält.
  code                varchar(16) not null unique,

  tour_variant        varchar(16) not null,
  participant_count   integer     not null check (participant_count between 1 and 20),
  amount_cents        integer     not null check (amount_cents >= 0),

  -- Käufer und Beschenkter sind selten dieselbe Person.
  purchaser_email     varchar(254) not null,
  recipient_name      varchar(120),
  message             text,

  payment_intent_id   varchar(255),
  paid_at             timestamptz,

  valid_until         timestamptz not null,

  -- Beides zusammen gesetzt oder beides null; ein eingelöster Gutschein ohne
  -- zugehörige Buchung wäre ein stiller Datenfehler.
  redeemed_at         timestamptz,
  redeemed_booking_id uuid references public.bookings(id) on delete set null,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),

  constraint vouchers_variant_known
    check (tour_variant in ('family', 'adult', 'pro')),
  constraint vouchers_redemption_complete
    check ((redeemed_at is null) = (redeemed_booking_id is null))
);

-- Der Einlöseweg schlägt ausschließlich über den Code nach.
create index if not exists vouchers_code_idx on public.vouchers (code);

-- Wie bei bookings: verhindert doppelte Gutscheine, wenn Stripe denselben
-- Webhook zweimal zustellt.
create unique index if not exists vouchers_payment_intent_id_key
  on public.vouchers (payment_intent_id)
  where payment_intent_id is not null;

-- RLS an, ohne Policy für anon oder authenticated: Gutscheine werden
-- ausschließlich über die API-Routen gelesen und geschrieben, die als
-- service_role laufen (rolbypassrls). Ein Gutscheincode ist ein
-- Zahlungsmittel — er darf nicht per PostgREST abfragbar sein.
alter table public.vouchers enable row level security;

commit;

-- ---------------------------------------------------------------------------
-- Kontrolle nach dem Anwenden
-- ---------------------------------------------------------------------------
-- set local role anon;
-- select count(*) from public.vouchers;   -- muss 0 ergeben, auch mit Zeilen
--
-- Rollback:
-- drop table if exists public.vouchers;
