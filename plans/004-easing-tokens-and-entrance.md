# 004 — Easing-Tokens einführen + Entrance-Keyframes korrigieren

- **Status**: TODO
- **Commit**: ce61e89
- **Severity**: MEDIUM
- **Category**: Cohesion & Tokens + Easing/Duration
- **Estimated scope**: 1 Datei (`apps/web/app/globals.css`), ~12 Zeilen

## Problem

Es gibt keine geteilten Easing-/Duration-Tokens; überall stehen schwache Built-in-Easings
(`ease-out`, `ease-in-out`) und verstreute Durations. Zusätzlich nutzt der Entrance-Fade das
**falsche** Easing und ist zu lang:

```css
/* apps/web/app/globals.css:231-233 — current */
.animate-fade-in { animation: fadeIn 0.5s ease-in-out; }   /* Entrance -> sollte ease-out, <300ms */

/* apps/web/app/globals.css:245-247 — current */
.animate-slide-in { animation: slideIn 0.6s ease-out; }    /* 600ms zu lang für UI-Entrance */
```

Regel: Eintritt/Austritt → **`ease-out`** (startet schnell, wirkt responsiv). `ease-in-out`
startet träge und verzögert genau den Moment, den man anschaut. UI-Animationen bleiben < 300 ms.

## Target

Tokens in einem `:root`-Block (starke Kurven aus dem Emil-Katalog), Entrances darauf umstellen:

```css
/* target — :root-Block oben in globals.css (in @layer base ODER ganz am Anfang der Datei) */
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);       /* starkes ease-out für UI */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);   /* On-Screen-Bewegung */
  --duration-fast: 150ms;
  --duration-base: 200ms;
}

/* target — Entrances */
.animate-fade-in  { animation: fadeIn 0.24s var(--ease-out); }   /* war 0.5s ease-in-out */
.animate-slide-in { animation: slideIn 0.28s var(--ease-out); }  /* war 0.6s ease-out */
```

## Repo conventions to follow

- Alle globalen Styles/Keyframes in `apps/web/app/globals.css`. Farb-Tokens leben in
  `apps/web/tailwind.config.ts`; **CSS-Custom-Properties** (Easing/Duration) gehören in einen
  `:root`-Block in `globals.css`, da sie sowohl in Keyframes-CSS als auch als Tailwind-Arbitrary
  (`ease-[var(--ease-out)]`) nutzbar sein sollen.
- Die Keyframes `fadeIn`/`slideIn` (Zeilen 235 / 250) bleiben inhaltlich unverändert — sie haben
  bereits korrekt einen initialen `translate` (kein reines Fade, kein `scale(0)`).

## Steps

1. `:root`-Block mit den vier Tokens oben in `globals.css` einfügen.
2. `.animate-fade-in` (Zeile 232): `fadeIn 0.5s ease-in-out` → `fadeIn 0.24s var(--ease-out)`.
3. `.animate-slide-in` (Zeile 246): `slideIn 0.6s ease-out` → `slideIn 0.28s var(--ease-out)`.
4. (Optional, kohäsions-Nachzug) die Button-/Card-Klassen aus Plan 002 zusätzlich von
   `ease-out` (Tailwind-Built-in) auf `ease-[var(--ease-out)]` heben — nur wenn 002 schon läuft.

## Boundaries

- Keyframe-Definitionen (`@keyframes fadeIn/slideIn`) **nicht** ändern — nur die
  `.animate-*`-Aufrufe + Tokens.
- Keine Massen-Umstellung aller Durations in diesem Plan — nur Tokens bereitstellen + Entrances fixen.
- Keine neuen Dependencies.

## Verification

- **Mechanical**: `turbo build` grün; die Tokens erscheinen in den kompilierten Styles.
- **Feel check**: DevTools → Animations-Panel, Playback 10 %:
  - Fade-In startet **schnell** und läuft weich aus (nicht träge am Anfang).
  - Gefühlte Dauer ~¼ s statt ½ s — snappier, ohne abgehackt zu wirken.
- **Done when**: `:root`-Tokens vorhanden, beide Entrances nutzen `var(--ease-out)` mit < 300 ms.
