# Animation-Verbesserungspläne — Escape Tour Warnemünde

Erzeugt vom Skill `improve-animations` (Emil Kowalski) auf Commit `ce61e89`, 2026-07-11.
Read-only-Audit → self-contained Pläne. Reihenfolge nach Hebel (Wirkung ÷ Aufwand).

| # | Titel | Schwere | Kategorie | Status |
|---|---|---|---|---|
| [001](001-reduced-motion.md) | Globales `prefers-reduced-motion` | 🔴 HIGH | Accessibility | ✅ DONE |
| [002](002-transition-all-targeted.md) | `transition-all` → gezielt | 🔴 HIGH | Performance | ✅ DONE (Kern: globals.css; optionaler Inline-Nachzug offen) |
| [003](003-progress-bar-scalex.md) | Progress-Fill `width`→`scaleX` | 🟡 MED | Performance | ✅ DONE |
| [004](004-easing-tokens-and-entrance.md) | Easing-Tokens + Entrances | 🟡 MED | Cohesion/Easing | ✅ DONE |

> Umgesetzt 2026-07-11 auf Branch `feat/animation-polish`. Backup: Tag `backup/pre-anim-2026-07-11` (@ ce61e89) + `plans/_backup-ce61e89/`. Verifikation: `tsc --noEmit` grün. Offen: Browser-Feel-Check (Reduced-Motion-Emulation, Paint-Flashing) + optionaler Schritt 2 in Plan 002 (~35 Inline-`transition-all`).

## Empfohlene Reihenfolge

1. **001** (Accessibility) — höchster Impact, minimales Risiko, ein Block.
2. **002** (transition-all) — größter Compound-Effekt, zentral in `globals.css`.
3. **004** (Tokens + Entrances) — legt Tokens an, die 002 optional nutzt.
4. **003** (Progress-Bar) — isolierter, kleiner Win.

## Abhängigkeiten

- **004 vor 002 (optionaler Schritt):** Der optionale Token-Nachzug in 002
  (`ease-[var(--ease-out)]`) setzt die Tokens aus 004 voraus. Kernänderungen von 002 sind
  unabhängig.
- Sonst keine Abhängigkeiten — Pläne sind einzeln ausführbar.

## Was NICHT geändert wird (bewusst)

- Press-Feedback (`active:scale-[0.97]`) — ist bereits korrekt.
- Step-Dots in `Onboarding`/`StoryIntro` — Breiten-Animation ist Layout-Semantik (siehe 003).
- Keyframe-Definitionen `fadeIn`/`slideIn` — haben korrekten initialen Transform.
