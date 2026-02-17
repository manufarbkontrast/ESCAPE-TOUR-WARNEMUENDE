## Session: [2026-02-17] - 3D Landmark Models

### Umgebung
- **Projekt**: escape-tour-warnemuende
- **Pfad**: /Users/craftongmbh/Downloads/escape-tour-warnemuende
- **Git**: ja

### Branch & Stand
- **Branch**: master
- **Letzter Commit**: 50b44a3 feat: custom 3D models for Leuchtturm and Teepott landmarks
- **Uncommitted Changes**: nein

### Was wurde gemacht
- Map-Cleanup: POI-Labels ausgeblendet, Marker vergroessert (48/38px), Namenslabels hinzugefuegt, Alter-Strom-Koordinate aus dem Wasser korrigiert (`apps/web/components/game/MapView.tsx`, `apps/web/lib/demo/data.ts`)
- Map-UX: Namenslabel nur fuer aktive Station, Z-Order-Fix (aktiver Marker immer vorne), maxBounds auf Warnemuende begrenzt, Vintage-Farbthema (faded+dusk) (`apps/web/components/game/MapView.tsx`)
- 3D-Modelle: Eigene stilisierte Low-Poly-GLB-Modelle fuer Leuchtturm und Teepott erstellt
  - `apps/web/scripts/generate-models.ts` — Build-Zeit-Script mit Three.js + GLTFExporter (inkl. FileReader-Polyfill fuer Node.js mit `onloadend`-Support)
  - `apps/web/public/models/lighthouse.glb` (35 KB) — Weisser Turm, rotes Band, blaue Laterne, rotes Dach
  - `apps/web/public/models/teepott.glb` (46 KB) — Runder Bau, geschwungenes LatheGeometry-Dach
  - `apps/web/components/game/map/landmarks.ts` — Landmark-Positionen und Orientierung
  - `apps/web/components/game/map/addLandmarkModels.ts` — Mapbox v3 native model source/layer Integration
  - `apps/web/components/game/MapView.tsx` — 2 Zeilen: Import + addLandmarkModels(map) im style.load-Handler
- Dependencies: `three`, `@types/three`, `tsx` als devDeps hinzugefuegt; `@types/mapbox-gl` entfernt (native Types von mapbox-gl@3.18.1)
- 461 Tests bestehen, visuell im Browser verifiziert

### Offene Aufgaben
- [ ] Feintuning der model-scale Werte fuer Leuchtturm und Teepott (aktuell [15,15,15] global)
- [ ] Separate Scales pro Modell ermoeglichen (Leuchtturm hoeher, Teepott breiter)
- [ ] Teepott-Position leicht adjustieren falls Ueberlappung mit Leuchtturm stoert
- [ ] Weitere Landmarks hinzufuegen (z.B. Kirche am Kirchplatz)
- [ ] Build-Pipeline: `generate-models` als prebuild-Script einbinden

### Architektur-Entscheidungen
- **Mapbox native model API statt Custom Layers**: Mapbox GL JS v3.18.1 hat native `type: 'model'` Source/Layer — einfacher, weniger Code, native Schatten/Beleuchtung
- **Build-Zeit GLB-Generierung statt Runtime**: Three.js nur als devDep, GLB-Dateien werden vorher generiert und als Static Assets ausgeliefert — kein Three.js im Client-Bundle
- **`@types/mapbox-gl` entfernt**: Community-Types haben keine Model-Layer-Types, die nativen Types aus dem mapbox-gl Package sind vollstaendig fuer v3
- **FileReader-Polyfill mit `onloadend`**: Three.js GLTFExporter nutzt `reader.onloadend` (nicht `onload`), Node.js hat keinen FileReader — minimaler Polyfill im Script

### Kontext fuer naechste Session
- Dev-Server: `cd apps/web && npx next dev -p 3003`, Demo-Code: `DEMO01`
- Modelle regenerieren: `npx tsx scripts/generate-models.ts` (aus apps/web/)
- Die `as any` Casts in `addLandmarkModels.ts` sind noetig weil TypeScript die model-spezifischen Properties nicht vollstaendig aus den nativen Types inferiert — funktioniert aber korrekt zur Laufzeit
- Mapbox Standard Style Config: `theme: 'faded'`, `lightPreset: 'dusk'`, `show3dObjects: true`
- Stationskoordinaten: Leuchtturm [12.0858, 54.1814], Teepott [12.0858, 54.1817], Alter Strom [12.0843, 54.1782], Am Strand [12.0845, 54.1805], Kirchplatz [12.0850, 54.1768]
- Supabase-Projekt: `zwextqejkoqjfbbphczo`
