## Session: [2026-07-13] - GPS-Feinschliff, iPad-Layout & feierabend-Skill

### Umgebung
- **Projekt**: escape-tour-warnemuende (Notion-Repo: ESCAPE-TOUR-WARNEMUENDE)
- **Pfad**: /Users/craftongmbh/Downloads/escape-tour-warnemuende
- **Git**: ja

### Branch & Stand
- **Branch**: master
- **Letzter Commit**: f27ad0d fix: hide Mapbox logo strip; merge station card flush with the tab bar
- **Uncommitted Changes**: nein
- **Heute**: 8 Commits, 14 Dateien, +1385 / -859 Zeilen

### Was wurde gemacht (diese Session)
- **Landing brand-level**: Echtes Logo + Standort-Picker auf der Landing Page; "Warnemünde" aus dem Header entfernt, alle tour-spezifischen Inhalte auf /warnemuende ausgelagert (8075b7a, 9d990f3)
- **Nautical Redesign**: Landing + /warnemuende im "Coastal Navigation Instrument"-Stil (Mono-Annotations, Lighthouse-Beam, Hairline-Rules) (fc3ed24)
- **GPS Too-far + Demo**: >5km-Hinweis "Du bist zu weit entfernt" ohne Zoom aus Warnemünde; ?demo=1-Modus mit bewegtem blauen Punkt zur Verifikation — Punkt rendert UND bewegt sich (numerisch + visuell bestätigt) (e272214)
- **Untere Tab-Leiste**: verschlankt & integriert, Safe-Area via max() in die Leiste gefaltet statt eigener leerer Streifen (c1d59eb)
- **Karten-Overlays vs. Tab-Leiste**: Stations-Karte war hinter der Leiste verdeckt → Overlays darüber gehoben; GPS-Button/Too-far-Pille über die Stations-Karte gehoben (b1c9ad9, 2e504b5)
- **Mapbox-Logo-Streifen weg**: Karte läuft wieder voll bis zum Rand (Logo/Attribution hinter der opaken Leiste versteckt), Stations-Karte bündig auf der Leiste = ein Balken. Bei iPad-Portrait 834×1017 verifiziert (f27ad0d)
- **Neuer globaler Skill `feierabend`** (~/.claude/skills/feierabend): speichert Chat-Kontext nach .claude/context/ + loggt die Tagesleistung als Notion-Zeile (Arbeitsfortschritt)

### Offene Aufgaben
- [ ] Optionale iPad-Politur: Stations-Karte auf max-Breite zentrieren (Querformat), Legende einklappbar, Blur-Performance beim Stationswechsel
- [ ] Mapbox-Attribution ist aktuell von der Leiste verdeckt (ToS-Graubereich) — ggf. dezente Attribution im Impressum ergänzen
- [ ] Aus Backlog: Resend, Stripe-Webhook, PostHog, Supabase-Admin-User

### Architektur-Entscheidungen
- **Karte voll bis zum Rand, Overlays via bottom-Offsets über der Leiste** (statt Karte zu kürzen): so bleibt das Mapbox-Logo hinter der opaken Nav versteckt und es entsteht kein Logo-Streifen zwischen den zwei Balken
- **Safe-Area via max(0.375rem, env(safe-area-inset-bottom))**: ohne viewport-fit=cover ist der Inset im iPad-Safari eh 0 → schlanke Leiste; auf Notch-Geräten würde es greifen
- **Demo-Modus ?demo=1**: simulierte, bewegte Position nahe der aktuellen Station, um den blauen Punkt ohne Vor-Ort-Test zu prüfen (gleicher setLocation→marker.setLngLat-Pfad wie echtes watchPosition-GPS)

### Deployment
- **Server**: Hetzner 188.245.121.230, PM2 + Nginx, HTTPS via Let's Encrypt (myescapetour.com)
- **Deploy**: `git push origin master` → ssh → `git pull` → `pnpm install --frozen-lockfile` → `npx turbo build --filter=@escape-tour/web` → `pm2 reload ecosystem.config.cjs && pm2 save`
- Alle heutigen Änderungen sind live (f27ad0d), Seite antwortet 200

### Kontext für nächste Session
- **iPad ist das Zielgerät** (nur iPad optimieren) — kein viewport-fit=cover, daher Safe-Area-Insets = 0 im Safari
- Nav-Höhe ≈ 73px; Overlay-Offsets: Stations-Karte `bottom-16` (rounded-t-2xl, bündig auf der Leiste), GPS-Button/Too-far-Pille `bottom-[12rem]`
- Next.js Dev-Server (Port 3128) neigt in dieser Umgebung nach HMR zu `.next`-Cache-Corruption (MODULE_NOT_FOUND / Blank Page) — bei Bedarf `rm -rf apps/web/.next` + neu starten; Prod-Build war stets sauber
- feierabend-Skill schreibt in Notion-DB "Tagesleistung" (data source `collection://a8e9e326-6928-4dad-8ef4-46cd0cea8bc0`)
