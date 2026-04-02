# Escape Tour Warnemünde — Zugänge

## Live-Server

- **URL:** http://116.203.57.207
- **Server:** Hetzner CX23, Ubuntu 24.04
- **SSH:** `ssh -i ~/.ssh/hetzner_escape_tour root@116.203.57.207`
- **App-Pfad:** `/var/www/escape-tour/app`
- **Prozess:** PM2 (`pm2 status`, `pm2 logs escape-tour`)

---

## Spiel testen

### Demo-Modus (ohne Buchung)

| | |
|---|---|
| **URL** | http://116.203.57.207/play |
| **Code** | `DEMO01` |
| **Tour** | Erwachsenen-Tour (12 Stationen) |

### Staff-Modus (Tablet-Verwaltung)

| | |
|---|---|
| **URL** | http://116.203.57.207/staff |
| **PIN** | `1234` (ändern via `STAFF_PIN` in `.env`) |
| **Funktion** | Session erstellen, Tour wählen, Tablet zuweisen, Gerät zurücksetzen |

---

## 3 Tour-Varianten

| Tour | Schwierigkeit | Preis | Alter | Dauer | Besonderheiten |
|------|--------------|-------|-------|-------|----------------|
| **Familien-Tour** | Leicht | 24,90 € | ab 8 | ~90 Min | Viel Multiple Choice, Hinweise in Fragen |
| **Erwachsenen-Tour** | Mittel | 29,90 € | ab 14 | ~120 Min | Mix aus 8 Puzzle-Typen inkl. Uhr + Schiebe-Puzzle |
| **Profi-Tour** | Schwer | 34,90 € | ab 16 | ~180 Min | Caesar-Chiffre, Latein, mehrstufige Berechnungen |

### Alle Lösungen — Familien-Tour

| Station | Antwort | Typ |
|---------|---------|-----|
| 1. Leuchtturm | b) 135 | Multiple Choice |
| 2. Teepott | b) Möwe | Multiple Choice |
| 3. Westmole | 1903 | Code |
| 4. Kurhaus | b) 1928 | Multiple Choice |
| 5. Strand | 1897 | Code |
| 6. Kirchplatz | b) Anker | Multiple Choice |
| 7. Museum | LOTSE | Akrostichon |
| 8. Vogtei | 31542 | Code |
| 9. Munch-Haus | b) Licht | Multiple Choice |
| 10. Alter Strom | b) Fisch | Multiple Choice |
| 11. Fischmarkt | PKSA | Text |
| 12. Bahnhof | 130353 | Meta-Code |

### Alle Lösungen — Erwachsenen-Tour

| Station | Antwort | Typ |
|---------|---------|-----|
| 1. Leuchtturm | 135 | Zählen |
| 2. Teepott | MOEWE | Foto-Suche |
| 3. Westmole | 1903 | Code |
| 4. Kurhaus | 1928 | Dokument |
| 5. Strand | 1897 | Code |
| 6. Kirchplatz | ANKER | Symbol |
| 7. Museum | LOTSE | Akrostichon |
| 8. Vogtei | 31542 | Code |
| 9. Munch-Haus | 19:23 | Uhr |
| 10. Alter Strom | KOMPASS | Schiebe-Puzzle |
| 11. Fischmarkt | PKSA | Text |
| 12. Bahnhof | 130353 | Meta-Code |

### Alle Lösungen — Profi-Tour

| Station | Antwort | Typ |
|---------|---------|-----|
| 1. Leuchtturm | 135 | Zählen (ohne Hinweis) |
| 2. Teepott | LARUS | Lateinischer Name |
| 3. Westmole | 40 | Rechnung (1923-1903)×2 |
| 4. Kurhaus | 120 | Quersumme(1928)×6 |
| 5. Strand | 189736 | 1897 + Alter 36 |
| 6. Kirchplatz | ANKER-6 | Symbol + Zacken |
| 7. Museum | KAPITÄN | Falsches Wort ersetzen |
| 8. Vogtei | 7315462 | 7-stelliger Siegel-Code |
| 9. Munch-Haus | 74 | Quersumme(1893)+53 |
| 10. Alter Strom | ALTER STROM | Caesar-Chiffre |
| 11. Fischmarkt | SCHEEL | Name vervollständigen |
| 12. Bahnhof | 13035322 | 8-stelliger Meta-Code |

---

## Admin-Dashboard

| | |
|---|---|
| **URL** | http://116.203.57.207/dashboard |
| **Login** | http://116.203.57.207/login |
| **User** | Muss in Supabase Dashboard angelegt werden |

---

## Externe Dienste

| Dienst | Dashboard | Status |
|--------|-----------|--------|
| **Supabase** | https://supabase.com/dashboard/project/zwextqejkoqjfbbphczo | Aktiv, DB geseeded |
| **Stripe** | https://dashboard.stripe.com | Webhook-Endpoint noch konfigurieren |
| **Resend** | https://resend.com | Account + Domain noch einrichten |
| **Mapbox** | https://account.mapbox.com | Token in `.env` setzen |
| **PostHog** | https://eu.posthog.com | Optional, Cookie-Consent eingebaut |

---

## Deploy-Befehl

```bash
ssh -i ~/.ssh/hetzner_escape_tour root@116.203.57.207 \
  "cd /var/www/escape-tour/app && git pull origin master && \
   npx turbo build --filter=@escape-tour/web && \
   pm2 delete all && fuser -k 3000/tcp 2>/dev/null; sleep 1 && \
   pm2 start ecosystem.config.cjs && pm2 save"
```

## Setup-Script (einmalig)

```bash
bash scripts/setup-production.sh
```
