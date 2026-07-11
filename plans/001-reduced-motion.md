# 001 — Globales `prefers-reduced-motion` einführen

- **Status**: TODO
- **Commit**: ce61e89
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 Datei (`apps/web/app/globals.css`), ~10 Zeilen

## Problem

Die App ist eine GPS-Walking-Tour, die draußen am Handy gespielt wird. Es gibt **143
`transition`-Vorkommen**, zwei Entrance-Keyframes (`fadeIn`, `slideIn`) und zwei
Dauerpuls-Keyframes auf der Karte (`markerPulse`, `userPulse`) — aber **nirgends** eine
`prefers-reduced-motion`-Behandlung. Nutzer mit vestibulären Beschwerden bekommen die volle
Bewegung inkl. dauerhaft pulsierendem User-Marker.

```bash
# Beleg: 0 Treffer im gesamten apps/web
grep -rn "prefers-reduced-motion" apps/web   # → (leer)
```

```css
/* apps/web/components/game/MapView.tsx:173 — läuft dauerhaft, ungated */
@keyframes userPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(2); opacity: 0; }
}
```

## Target

Ein globaler Reduced-Motion-Block am Ende von `apps/web/app/globals.css`. Bewegung wird
neutralisiert, **Opacity/Farbe bleibt** (Reduced Motion heißt *weniger*, nicht *keine*):

```css
/* target — ans Ende von globals.css, außerhalb @layer */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Repo conventions to follow

- Globale Styles + Keyframes leben in `apps/web/app/globals.css` (Tailwind v3, `@layer`).
- Der Block gehört **außerhalb** eines `@layer` ans Dateiende, damit `!important` sicher
  über alle Utilities gewinnt.

## Steps

1. `apps/web/app/globals.css` öffnen, ans **Dateiende** (nach der schließenden `}` des
   letzten `@layer`) den Target-Block einfügen.

## Boundaries

- Keine Markup-/Komponenten-Änderungen.
- Keine einzelnen Animationen entfernen — dieser Plan ist nur der globale Schalter.
  (Feineres Reduzieren einzelner Effekte ist Sache späterer Pläne.)
- Keine neuen Dependencies.

## Verification

- **Mechanical**: `pnpm --filter web lint` bzw. `turbo lint` → keine neuen Fehler; `turbo build` grün.
- **Feel check**: DevTools → Rendering → „Emulate CSS prefers-reduced-motion: reduce" aktivieren, dann:
  - Karte öffnen → User-Marker **pulsiert nicht mehr** (steht still, bleibt sichtbar).
  - Seitenwechsel/Entrances → kein Slide/Fade-Move mehr, Inhalt erscheint quasi sofort.
  - Buttons → Farb-/Opacity-Feedback bleibt erhalten.
- **Done when**: Mit aktivem Reduced-Motion ist keine Positions-/Scale-Bewegung mehr sichtbar,
  aber die UI bleibt bedien- und lesbar.
