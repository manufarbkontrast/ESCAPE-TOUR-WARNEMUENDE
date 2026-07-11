# 002 — `transition-all` durch gezielte Transitions ersetzen

- **Status**: TODO
- **Commit**: ce61e89
- **Severity**: HIGH (Compound-Effekt über viele Elemente)
- **Category**: Performance
- **Estimated scope**: 1 zentrale Datei (`globals.css`, Button-/Card-System) + optional ~35 Tailwind-Stellen

## Problem

`transition-all` animiert **jede** wechselnde Property off-GPU — inkl. `box-shadow`, `border`,
`backdrop-filter`. Besonders teuer bei den Glass-Cards (`blur(20px)`), die per `transition-all`
ihren Blur/Shadow mitanimieren (in Safari spürbares Ruckeln).

```css
/* apps/web/app/globals.css:76 — .btn (zentral, betrifft ALLE Buttons) */
.btn { @apply ... transition-all duration-150 ease-out ... active:scale-[0.97]; }

/* apps/web/app/globals.css:120 — .btn-icon */
.btn-icon { @apply ... transition-all duration-150 ease-out ... active:scale-[0.95]; }

/* apps/web/app/globals.css:144 + :153 — .card / .card-glass (blur(20px)!) */
.card { @apply rounded-xl p-6 transition-all duration-200; ... }
.card-glass { @apply rounded-xl p-6 transition-all duration-200; backdrop-filter: blur(20px); ... }
```

## Target

Nur die tatsächlich wechselnden Properties animieren. `.btn` ändert bei Hover/Active
`background-color`, `box-shadow`, `border-color` und `transform` (Press-Scale):

```css
/* target */
.btn      { @apply ... transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out ... active:scale-[0.97]; }
.btn-icon { @apply ... transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out ... active:scale-[0.95]; }
.card       { @apply rounded-xl p-6 transition-[transform,box-shadow,border-color] duration-200; ... }
.card-glass { @apply rounded-xl p-6 transition-[transform,box-shadow,border-color] duration-200; ... } /* blur NICHT animieren */
```

## Repo conventions to follow

- Button-/Card-Klassen sind zentral in `apps/web/app/globals.css` unter `@layer components`
  definiert — **eine** Änderung dort wirkt projektweit. Das ist die höchste Hebelwirkung.
- Tailwind v3 unterstützt `transition-[a,b,c]` (arbitrary properties) — Schreibweise ohne
  Leerzeichen, Kommagetrennt.

## Steps

1. In `globals.css` die vier Klassen (`.btn` :76, `.btn-icon` :120, `.card` :144,
   `.card-glass` :153) von `transition-all` auf die jeweilige `transition-[…]`-Liste umstellen (siehe Target).
2. **Optional (zweiter Durchgang):** die ~35 inline `transition-all`-Stellen in
   `components/game/**` und `components/game/puzzles/**`, die nur `background-color` bei Hover
   ändern, auf `transition-colors` umstellen. Beispiel `GameMenu.tsx:114`:
   `transition-all duration-150` → `transition-colors duration-150`.
   Bei Stellen mit `active:scale-95` stattdessen `transition-[transform,background-color]`.

## Boundaries

- Keine Markup-/Layout-Änderungen, keine Farb-/Shadow-Werte ändern — nur die `transition`-Property.
- `backdrop-filter: blur()` **niemals** in die Transition-Liste aufnehmen.
- Wenn eine Stelle mehr als Farbe animiert (z. B. zusätzlich `transform`), die passende
  kombinierte Liste nehmen — nicht blind `transition-colors`.
- Keine neuen Dependencies.

## Verification

- **Mechanical**: `turbo lint` + `turbo build` grün.
- **Feel check**: DevTools → Performance/Rendering, „Paint flashing" an:
  - Button-Hover/Press → nur Button repaintet, kein Layout-Ruck; Press-Scale weiter sichtbar.
  - Glass-Card-Hover → Shadow/Border faden, aber **kein** Blur-Neuberechnen (in Safari testen).
- **Done when**: Kein `transition-all` mehr in `globals.css`; Hover/Press fühlen sich identisch
  oder smoother an, keine visuelle Regression.
