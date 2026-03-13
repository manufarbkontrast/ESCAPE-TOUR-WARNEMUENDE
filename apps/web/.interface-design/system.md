# Interface Design System — Escape Tour Warnemünde

## Direction & Feel

**Metaphor:** Harbor pilot's office at dusk — dim ambient light, brass instruments catching lamplight, charts spread across a wooden desk.

**Temperature:** Warm but serious. Inhabited dark surfaces, not empty dark mode. Brass feels like a physical material, not an accent color.

**Signature:** Ship's log sensibility — each station feels like turning to the next page of a captain's logbook. Progress is an unfolding narrative.

## Color System

**Foundation:** Navy palette (050d17 → eef2f7)
**Accent:** Brass palette (3e1c08 → fef9ee) — oxidized, warm, lamplight glow
**Neutral:** Sand palette (312721 → faf8f5)

**Surface tokens (dark mode):**
- Base canvas: navy-950 (`#050d17`)
- Elevated surfaces: `rgba(11, 25, 41, 0.5)` with `backdrop-blur(8px)`
- Overlay surfaces: `rgba(11, 25, 41, 0.85-0.95)` with `backdrop-blur(12-20px)`
- Active/highlighted: `rgba(230, 146, 30, 0.04-0.08)`

**Border tokens:**
- Default: `rgba(255, 255, 255, 0.04)` — whisper-quiet, disappears unless you look
- Brass accent: `rgba(230, 146, 30, 0.1-0.15)` — for active/highlighted elements
- Semantic (error): `rgba(239, 68, 68, 0.1-0.12)`
- Semantic (success): `rgba(34, 197, 94, 0.1)`

**Text hierarchy:**
- Primary: `sand-50` (#faf8f5)
- Secondary: `sand-200` (#e6ddd0)
- Tertiary: `sand-400` (#c1ac91)
- Muted: `sand-500-600`
- Accent: `brass-400` (#edaa3b)

## Typography

- **Display:** Playfair Display (serif) — headings, station names, celebration text
- **Body:** Inter (sans-serif) — UI text, descriptions, labels
- **Data:** JetBrains Mono — codes, numbers, tabular data
- **Headlines:** `tracking-tight`, `font-bold`
- **Labels:** `text-xs`, `font-medium`, `tracking-wide uppercase` for metadata

## Depth Strategy

**Layered shadows** — no borders-only, no single shadow. Multi-layer box-shadow:

```css
/* Card / surface */
box-shadow:
  0 0 0 0.5px rgba(255, 255, 255, 0.03),
  0 1px 2px rgba(0, 0, 0, 0.08),
  0 2px 4px rgba(0, 0, 0, 0.04);

/* Primary button — inner glow */
box-shadow:
  inset 0 1px 0 rgba(255, 255, 255, 0.2),
  0 1px 3px rgba(0, 0, 0, 0.15),
  0 0 12px rgba(230, 146, 30, 0.15);

/* Brass glow (active/highlight) */
box-shadow: 0 0 16px rgba(230, 146, 30, 0.06);
```

## Spacing

- **Base unit:** 4px
- **Component padding:** 12-16px
- **Section gaps:** 20-24px (space-y-5, space-y-6)
- **Card padding:** 24-32px (p-6, p-8)

## Border Radius

- **Buttons:** `rounded-full` (pill shape)
- **Cards/panels:** `rounded-2xl` (16px)
- **Modals/sheets:** `rounded-3xl` (24px)
- **Icon buttons:** `rounded-full` (circular)
- **Badges/pills:** `rounded-full`
- **Images:** `rounded-2xl`

## Button Patterns

**Primary (`.btn-primary`):**
- Pill shape, brass-500 fill, navy-950 text
- Inner glow + outer brass shadow
- `active:scale-[0.97]` — no bounce
- Gap with icon via `gap-2`

**Secondary (`.btn-secondary`):**
- Ghost pill, transparent bg, `border sand-700/40`
- Brass border + glow on hover
- Sand-100 text

**Icon buttons (`.btn-icon-sm/md/lg`):**
- Circular, glass background: `rgba(11, 25, 41, 0.75)` + `backdrop-blur(12px)`
- Whisper border: `rgba(255, 255, 255, 0.06)`
- Hover: brass border glow

## Icon System

**Library:** Lucide React
**Stroke width:** 1.5 (default), 2 (active/emphasis)
**Sizes:** h-3.5 (hint icons), h-4 (inline), h-5 (nav/menu), h-6 (header)

## Animation

- **Micro-interactions:** 150ms, ease-out
- **View transitions:** 200-300ms via Framer Motion
- **Press feedback:** `active:scale-[0.97]` on buttons, `active:scale-[0.95]` on icon buttons
- **No bounce/spring** on buttons — spring only on menu panel slide
- **Brass glow pulse:** for active map markers, progress indicators

## Component Patterns

**Bottom nav:** Subtle — no filled boxes. Active = brass-tinted bg + glow, text accent. Inactive = muted icon + text.

**Overlays/panels:** Glass morphism — high blur (16-20px), dark semi-transparent bg, whisper border.

**Cards:** `.card` class — rounded-2xl, layered shadow, backdrop-blur, rgba borders.

**Headers:** Fixed, `bg-navy-900/90 backdrop-blur-xl`, whisper border-bottom.

**Progress bars:** Thin (h-2), gradient fill with brass glow shadow.
