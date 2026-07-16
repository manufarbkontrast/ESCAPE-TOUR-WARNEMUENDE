## Session: [2026-03-16] - Color Scheme Overhaul & Cross-Machine Context

### Umgebung
- **Projekt**: escape-tour-warnemuende
- **Pfad**: /Users/craftongmbh/Downloads/escape-tour-warnemuende
- **Git**: ja

### Branch & Stand
- **Branch**: master
- **Letzter Commit**: 7593cdd chore: add CLAUDE.md project context for cross-machine collaboration
- **Uncommitted Changes**: nein

### Was wurde gemacht (diese Session)
- Farbschema-Umstellung: Alle brass/gold/orange Farben aus 43+ Dateien entfernt, ersetzt durch weiss/sand
  - globals.css: btn-primary, btn-secondary, btn-icon, card-hover, focus rings, scrollbar, patterns, divider
  - Marketing-Seiten: page.tsx, buchen, kontakt, touren, preise, AGB, bestaetigung, error, not-found
  - Game-Komponenten: MapView, StationView, PuzzleRenderer, StoryContent, HintSystem, Timer, AudioPlayer, CodeInput, GameMenu, Onboarding
  - Alle 9 Puzzle-Typen: ARPuzzle, AudioPuzzle, CombinationPuzzle, CountPuzzle, DocumentAnalysisPuzzle, LogicPuzzle, NavigationPuzzle, PhotoSearchPuzzle, SymbolFindPuzzle, TextInputPuzzle
  - Admin: dashboard, admin-shell, bookings-table, login
  - UI: OfflineIndicator, FaqAccordion, MobileMenu, LegalPageLayout, Header, Footer
- Emojis durch SVG-Linienzeichnungen ersetzt (Anker, Ticket, Karte, Lupe, Kompass)
- Buchungsseite UX: Dekorative Icons entfernt, Schriftgroessen erhoeht, Feld-Validierung mit Fehlermeldungen
- CLAUDE.md ins Repo committed fuer Cross-Machine-Zugriff
- Deployment auf Hetzner nach jeder Aenderung

### Was in vorherigen Sessions gemacht wurde
- Email-System mit Resend (Buchungsbestaetigung + Kontaktformular)
- Admin-Dashboard mit Supabase-Auth-Schutz (dashboard, buchungen)
- PostHog-Analytics-Integration
- Stripe-Checkout + Webhooks
- 37+ Tests (Vitest)
- Hetzner-Server-Setup (Node.js 22, Nginx, PM2)
- 3D-Landmark-Modelle (Leuchtturm, Teepott) fuer Mapbox

### Offene Aufgaben
- [ ] Resend: Account erstellen, Domain verifizieren, RESEND_API_KEY setzen
- [ ] Stripe Webhook: Endpoint erstellen, STRIPE_WEBHOOK_SECRET setzen
- [ ] PostHog: Account erstellen, NEXT_PUBLIC_POSTHOG_KEY setzen
- [ ] Domain + SSL: DNS A-Record auf 116.203.57.207, dann certbot --nginx
- [ ] Supabase Admin-User: Ueber Supabase-Dashboard erstellen fuer /login
- [ ] 3D-Modell Feintuning: Separate Scales pro Modell, Position adjustieren
- [ ] Weitere Landmarks (z.B. Kirche am Kirchplatz)

### Architektur-Entscheidungen
- **Weiss statt Gold**: User-Feedback war dass brass/gold "KI-maessig" aussieht. Gesamte Palette auf weiss/sand umgestellt.
- **SVG statt Emojis**: Emojis wirken unprofessionell, SVG-Linienzeichnungen passen zum maritimen Thema
- **Keine dekorativen Lucide-Icons**: Nur funktionale Icons (Pfeile, Plus/Minus, Schliessen)
- **CLAUDE.md im Repo**: Ermoeglicht Cross-Machine-Arbeit, wird automatisch geladen

### Deployment
- **Server**: Hetzner CX23, IP 116.203.57.207, Ubuntu 24.04
- **SSH**: `ssh -i ~/.ssh/hetzner_escape_tour root@116.203.57.207`
- **Deploy**: `git push && ssh ... "cd /var/www/escape-tour/app && git pull && npx turbo build --filter=@escape-tour/web && pm2 delete all && fuser -k 3000/tcp; pm2 start ecosystem.config.cjs && pm2 save"`
- **Dev-Server**: `cd apps/web && npx next dev -p 3003`, Demo-Code: `DEMO01`

### Kontext fuer naechste Session
- Supabase-Projekt: `zwextqejkoqjfbbphczo`
- brass-Farben sind noch in tailwind.config.ts definiert (fuer den Fall dass sie spaeter gebraucht werden), aber nirgends mehr verwendet
- `as any` Casts in `addLandmarkModels.ts` sind noetig wegen fehlender model-Types in Mapbox-TypeDefs
- Stationskoordinaten: Leuchtturm [12.0858, 54.1814], Teepott [12.0858, 54.1817], Alter Strom [12.0843, 54.1782]
