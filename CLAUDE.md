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

- **Server**: Hetzner CX23, IP `116.203.57.207`, Ubuntu 24.04
- **SSH**: `ssh -i ~/.ssh/hetzner_escape_tour root@116.203.57.207`
- **App path**: `/var/www/escape-tour/app`
- **Process**: PM2 with `ecosystem.config.cjs` — runs `npx next start -p 3000`
- **Proxy**: Nginx on port 80 → localhost:3000
- **SSL**: Not yet — needs domain DNS A-record, then `certbot --nginx`

### Deploy workflow

```bash
git push origin master
ssh -i ~/.ssh/hetzner_escape_tour root@116.203.57.207 \
  "cd /var/www/escape-tour/app && git pull origin master && \
   npx turbo build --filter=@escape-tour/web && \
   pm2 delete all && fuser -k 3000/tcp 2>/dev/null; sleep 1 && \
   pm2 start ecosystem.config.cjs && pm2 save"
```

## Supabase Type Workaround

Supabase `.select()` returns `never` type in this project. Use explicit type casts:

```typescript
import type { Database } from '@escape-tour/database/src/types/supabase'
type BookingRow = Database['public']['Tables']['bookings']['Row']
const { data } = await supabase.from('bookings').select().eq('id', id).single()
const booking = data as BookingRow | null
```

## Open Setup Tasks

1. **Resend**: Create account, verify domain, set `RESEND_API_KEY`
2. **Stripe Webhook**: Create endpoint → `/api/webhooks/stripe`, set `STRIPE_WEBHOOK_SECRET`
3. **PostHog**: Create account, set `NEXT_PUBLIC_POSTHOG_KEY`
4. **Domain + SSL**: DNS A-record → 116.203.57.207, then `certbot --nginx`
5. **Supabase admin user**: Create via Supabase dashboard for /login access
