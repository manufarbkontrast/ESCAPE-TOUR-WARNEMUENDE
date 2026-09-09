# Escape Tour Warnemünde — Projektkontext

## Tech Stack

- **Framework**: Next.js 14 App Router, TypeScript, pnpm monorepo
- **Packages**: `@escape-tour/web` (app), `@escape-tour/shared`, `@escape-tour/database`, `@escape-tour/game-logic`
- **Database**: Supabase (PostgreSQL) — generated types in `packages/database/src/types/supabase.ts`
- **Payments**: Stripe Checkout Sessions + Webhooks (`/api/checkout`, `/api/webhooks/stripe`)
- **Email**: Resend — templates in `apps/web/lib/email/templates/`
- **Maps**: Mapbox GL with 3D terrain, custom markers, Mapbox Directions API for walking navigation
- **State**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS — navy/white/sand palette, glass-morphic UI (`card-glass` class)
- **Icons**: SVG line drawings for decorative use, Lucide React only for functional icons
- **Animations**: Framer Motion
- **Analytics**: PostHog (EU host)
- **Language**: German UI throughout

## Design Rules (IMPORTANT)

**Marketing-Redesign (2026-09-09):** Der vom Nutzer freigegebene HTML-Entwurf
verwendet Sand/Marinegrün. `app/(marketing)/maritime.css` und die `coast`-Tokens
gelten nur für öffentliche Marketingseiten. Die folgenden dunklen Designregeln
gelten weiterhin für Spiel und Administration.


- **NO brass/gold/orange colors** — the entire site uses white and sand-grey tones as accents
- **NO emojis** — use SVG line drawings instead
- **NO decorative Lucide icons** on form labels — only functional icons (arrows, plus/minus, close)
- **NO route lines on the map** — use text-only NavigationPanel for walking directions
- **btn-primary** = white background, dark text (defined in globals.css)
- **Accent color** = white on navy-950 backgrounds; neon-cyan (`text-neon-300` #67e8f9, `text-neon-400` #22d3ee) is used sparingly for emphasis (links, active states, highlights) — this is part of the established visual identity
- **Secondary text** = sand-200 to sand-500, or `text-white/50`–`text-white/70` on dark backgrounds
- **Font sizes** should be generous: labels text-sm font-semibold, inputs text-base, headings text-2xl+
- **Game cards** use `card-glass` class: `rgba(10, 10, 10, 0.88)` bg with `backdrop-filter: blur(20px)`
- **Difficulty badges** use white text with opacity backgrounds (no color coding)

## Game Architecture

### Route C — 12 Stations (Rundlauf Warnemünde)

```
Start/Ende: Shoes Please am Leuchtturm
1. Leuchtturm → 2. Teepott → 3. Westmole → 4. Kurhaus → 5. Strand →
6. Kirchplatz → 7. Heimatmuseum → 8. Vogtei → 9. Edvard-Munch-Haus →
10. Alter Strom → 11. Fischmarkt → 12. Bahnhof → Rückweg Leuchtturm
```

### Station Flow

```
map → station (intro → story → puzzle → success → transition) → map
```

- Transition screen: narrative text + walking hint + "Navigation starten" button
- Station type fields: `transitionTextDe/En`, `walkingHintDe/En`
- Map shows NavigationPanel overlay with turn-by-turn walking instructions (Mapbox Directions API, German)
- Demo mode (`DEMO01`): simulates user position ~200m from current station

### Map Behavior

- Map always rendered, blurred when station view is active
- Station view overlays via AnimatePresence on blurred map
- NavigationPanel: text-only turn-by-turn directions (no drawn route line)
- User location: real GPS when nearby (<5km), otherwise zoom to station
- Demo: fake position always in Warnemünde for testing

## Route Structure

```
app/
├── (marketing)/          # Public pages: /, /buchen, /kontakt, /touren, /preise, /agb, etc.
├── (game)/               # Game play: /play, /play/[sessionId], /play/[sessionId]/complete
├── (admin)/              # Auth-gated: /dashboard, /buchungen (Supabase Auth)
├── login/                # Admin login (outside auth gate)
└── api/                  # API routes: checkout, contact, webhooks/stripe, game/*
```

## Deployment

**Aktueller Veröffentlichungsweg:** siehe `docs/DEPLOYMENT.md`. Seit dem maritimen
Redesign werden Releases separat gebaut und über den `cwd` in der PM2-Konfiguration
aktiviert. Der frühere In-place-Build unten ist damit abgelöst.


- **Server**: Hetzner, IP `188.245.121.230`, Ubuntu 24.04 (hostname `escapetour`)
- **SSH**: `ssh -i ~/.ssh/hetzner_escape_tour_new root@188.245.121.230`
- **App path**: `/var/www/escape-tour/app`
- **Process**: PM2 with `ecosystem.config.cjs` (liegt nur auf Server, nicht im Repo) — runs `npx next start -p 3000`
- **Proxy**: Nginx on port 80 → localhost:3000
- **Domain**: `myescapetour.com` (+ `www`), DNS zeigt auf den Server
- **SSL**: eingerichtet (Certbot, Port 443); Port 80 leitet auf https um.
  Aufrufe der **nackten IP** liefern absichtlich 404 — das ist der
  `default_server`-Block von Certbot, kein Defekt. Zum Prüfen immer die Domain nehmen.

### Deploy workflow

```bash
git push origin master
ssh -i ~/.ssh/hetzner_escape_tour_new root@188.245.121.230 \
  "cd /var/www/escape-tour/app && git pull origin master && \
   pnpm install --frozen-lockfile && \
   npx turbo build --filter=@escape-tour/web && \
   pm2 reload ecosystem.config.cjs && pm2 save"
```

## Supabase Type Workaround

Supabase `.select()` returns `never` type in this project. Use explicit type casts:

```typescript
import type { Database } from '@escape-tour/database/src/types/supabase'
type BookingRow = Database['public']['Tables']['bookings']['Row']
const { data } = await supabase.from('bookings').select().eq('id', id).single()
const booking = data as BookingRow | null
```

## Admin-Bereich: Rollen

`/dashboard` und `/buchungen` verlangen `app_metadata.role = 'admin'` — nicht bloß ein
eingeloggtes Konto. Geprüft wird an drei Stellen, die denselben Wert lesen:

- `lib/auth/roles.ts` (`isAdmin`) — von `middleware.ts` und `app/(admin)/layout.tsx` benutzt
- RLS-Funktion `public.is_admin()` — liest `app_metadata.role` aus dem JWT

Die Rolle steht bewusst in `app_metadata` und nicht in `user_metadata`: `user_metadata`
schreibt der Client über `auth.updateUser()` selbst.

Vergeben (braucht `SUPABASE_SERVICE_ROLE_KEY` in `apps/web/.env.local`):

```bash
cd apps/web
node --env-file=.env.local --import tsx scripts/set-admin-role.ts chef@example.de
node --env-file=.env.local --import tsx scripts/set-admin-role.ts chef@example.de --remove
node --env-file=.env.local --import tsx scripts/set-admin-role.ts --list   # wer hat sie
```

Als `pnpm set-admin-role <email>` auch, aber `pnpm` liegt nicht überall auf dem PATH
(dann `corepack pnpm`) — der `node`-Aufruf oben läuft ohne.

Die Rolle steckt im JWT — betroffene Konten müssen sich danach einmal neu anmelden.

Buchungen des Stripe-Webhooks haben `user_id = NULL` (Gäste loggen sich nie ein). Ohne die
Admin-Policy aus `20260906170600_admin_role_and_dashboard_access.sql` sieht auch ein Admin
davon keine einzige Zeile.

## Open Setup Tasks

1. **Resend**: Create account, verify domain, set `RESEND_API_KEY`
2. **Stripe Webhook**: Create endpoint → `/api/webhooks/stripe`, set `STRIPE_WEBHOOK_SECRET`
3. **PostHog**: Create account, set `NEXT_PUBLIC_POSTHOG_KEY`
4. ~~**Domain + SSL**~~ — erledigt, `myescapetour.com` läuft über https.
   ~~**`NEXT_PUBLIC_APP_URL`**~~ — erledigt am 2026-09-07: steht auf dem Server
   auf `https://myescapetour.com`, danach neu gebaut. Der Wert wird beim Build
   fest in `app/api/checkout/route.ts` und `app/api/checkout/voucher/route.ts`
   eingebacken (im gebauten Bundle steht kein `process.env`-Zugriff mehr) —
   **nach jeder Änderung daran neu bauen**, `pm2 reload` allein genügt nicht.
5. **Supabase admin user**: Create via Supabase dashboard, then grant the role:
   `cd apps/web && pnpm set-admin-role <email>` (see „Admin-Bereich: Rollen")
