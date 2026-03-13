# Escape Tour Warnemünde — Projektkontext

## Tech Stack

- **Framework**: Next.js 14 App Router, TypeScript, pnpm monorepo
- **Packages**: `@escape-tour/web` (app), `@escape-tour/shared`, `@escape-tour/database`, `@escape-tour/game-logic`
- **Database**: Supabase (PostgreSQL) — generated types in `packages/database/src/types/supabase.ts`
- **Payments**: Stripe Checkout Sessions + Webhooks (`/api/checkout`, `/api/webhooks/stripe`)
- **Email**: Resend — templates in `apps/web/lib/email/templates/`
- **Maps**: Mapbox GL with custom 3D models (Leuchtturm, Teepott)
- **State**: Zustand with localStorage persistence
- **Styling**: Tailwind CSS — navy/white/sand palette, glass-morphic UI
- **Icons**: SVG line drawings for decorative use, Lucide React only for functional icons
- **Animations**: Framer Motion
- **Analytics**: PostHog (EU host)
- **Language**: German UI throughout

## Design Rules (IMPORTANT)

- **NO brass/gold/orange colors** — the entire site uses white and sand-grey tones as accents
- **NO emojis** — use SVG line drawings instead
- **NO decorative Lucide icons** on form labels — only functional icons (arrows, plus/minus, close)
- **btn-primary** = white background, dark text (defined in globals.css)
- **Accent color** = white on navy-950 backgrounds
- **Secondary text** = sand-200 to sand-500
- **Font sizes** should be generous: labels text-sm font-semibold, inputs text-base, headings text-2xl+

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
