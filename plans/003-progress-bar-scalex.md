# 003 — Progress-Fill von `width` auf `transform: scaleX()` umstellen

- **Status**: TODO
- **Commit**: ce61e89
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 Datei (`apps/web/app/(game)/layout.tsx`), ~6 Zeilen

## Problem

Die Fortschrittsanzeige der laufenden Tour animiert ihre **`width`** per `transition-all` —
das löst pro Frame Layout + Paint aus, während der Nutzer läuft und die Anzeige oft aktualisiert.

```tsx
/* apps/web/app/(game)/layout.tsx:42-49 — current */
<div className="h-2.5 w-32 rounded-full bg-dark-800 overflow-hidden">
  <div
    className="h-full rounded-full transition-all duration-500 ease-out"
    style={{
      width: `${progressPercent}%`,
      background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.5))',
      boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)',
    }}
  >
```

## Target

Volle Breite + `scaleX` von links animieren — läuft auf der GPU (nur Composite):

```tsx
/* target */
<div className="h-2.5 w-32 rounded-full bg-dark-800 overflow-hidden">
  <div
    className="h-full w-full origin-left rounded-full transition-transform duration-500 ease-out"
    style={{
      transform: `scaleX(${progressPercent / 100})`,
      background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.5))',
      boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)',
    }}
  >
```

## Repo conventions to follow

- Inline-`style` für dynamische Werte + Tailwind-Utilities für Statisches ist im Repo Standard
  (siehe dieselbe Datei). `origin-left` = `transform-origin: left`.
- Parent hat `overflow-hidden` → der Gradient wird beim Skalieren sauber geclippt.

## Steps

1. In `apps/web/app/(game)/layout.tsx` beim Fill-`div` (Zeile ~44):
   - Klassen `transition-all` → `transition-transform`, zusätzlich `w-full origin-left`.
   - `style`: `width: \`${progressPercent}%\`` → `transform: \`scaleX(${progressPercent / 100})\``.

## Boundaries

- **Nur** die Fill-Bar in `layout.tsx`. Die Step-Dots in `Onboarding.tsx:202` und
  `StoryIntro.tsx:112` **NICHT** anfassen — dort ist die Breiten-Änderung (6↔24px) Teil der
  Layout-Semantik (aktiver Dot schiebt die Reihe), scaleX würde sie verzerren.
- Gradient/Shadow-Werte unverändert lassen.
- Keine neuen Dependencies.

## Verification

- **Mechanical**: `turbo lint` + `turbo build` grün; kein TS-Fehler (`progressPercent` ist number).
- **Feel check**: Tour spielen, Station abschließen:
  - Balken wächst **von links** flüssig auf den neuen Stand (nicht von der Mitte, nicht springend).
  - DevTools → Rendering → „Paint flashing": beim Wachsen **kein** grünes Repaint der Bar-Umgebung.
  - Bei 0 % ist die Bar unsichtbar (scaleX(0)), bei 100 % voll — visuell identisch zu vorher.
- **Done when**: Fill nutzt `transform`, kein `width` in der Animation mehr, Optik unverändert.
