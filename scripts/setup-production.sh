#!/bin/bash
# =============================================================================
# Production Setup Script — Escape Tour Warnemuende
# Run this AFTER deploying to Hetzner to configure all external services
# =============================================================================

set -euo pipefail

echo "=== Escape Tour Warnemuende — Production Setup ==="
echo ""

# ---------------------------------------------------------------------------
# 1. Supabase Admin User
# ---------------------------------------------------------------------------
echo "--- SCHRITT 1: Supabase Admin-User ---"
echo ""
echo "  1. Oeffne: https://supabase.com/dashboard/project/zwextqejkoqjfbbphczo/auth/users"
echo "  2. Klicke 'Add user' -> 'Create new user'"
echo "  3. Email: admin@escape-tour-warnemuende.de"
echo "  4. Passwort: (sicheres Passwort waehlen, notieren!)"
echo "  5. 'Auto Confirm User' aktivieren"
echo ""
read -p "  Admin-User angelegt? [Enter zum Fortfahren] "

# ---------------------------------------------------------------------------
# 2. Resend API Key
# ---------------------------------------------------------------------------
echo ""
echo "--- SCHRITT 2: Resend E-Mail ---"
echo ""
echo "  1. Oeffne: https://resend.com/signup"
echo "  2. Account erstellen"
echo "  3. Domain hinzufuegen: escape-tour-warnemuende.de"
echo "  4. DNS-Records setzen (MX, TXT fuer SPF/DKIM)"
echo "  5. API Key erstellen: https://resend.com/api-keys"
echo ""
read -p "  Resend API Key: " RESEND_KEY
echo "  -> RESEND_API_KEY=$RESEND_KEY"

# ---------------------------------------------------------------------------
# 3. Stripe Webhook
# ---------------------------------------------------------------------------
echo ""
echo "--- SCHRITT 3: Stripe Webhook ---"
echo ""
echo "  1. Oeffne: https://dashboard.stripe.com/webhooks"
echo "  2. Klicke 'Add endpoint'"
echo "  3. URL: https://escape-tour-warnemuende.de/api/webhooks/stripe"
echo "  4. Events: checkout.session.completed"
echo "  5. Webhook-Secret kopieren (whsec_...)"
echo ""
read -p "  Stripe Webhook Secret: " STRIPE_WH
echo "  -> STRIPE_WEBHOOK_SECRET=$STRIPE_WH"

# ---------------------------------------------------------------------------
# 4. .env auf Server schreiben
# ---------------------------------------------------------------------------
echo ""
echo "--- SCHRITT 4: .env auf Server konfigurieren ---"
echo ""

SERVER="root@116.203.57.207"
SSH_KEY="$HOME/.ssh/hetzner_escape_tour"
APP_PATH="/var/www/escape-tour/app"

echo "  Schreibe .env auf Server..."

# Supabase Keys aus dem Dashboard:
echo ""
echo "  Supabase-Keys findest du unter:"
echo "  https://supabase.com/dashboard/project/zwextqejkoqjfbbphczo/settings/api"
echo ""
read -p "  NEXT_PUBLIC_SUPABASE_URL: " SUPA_URL
read -p "  NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPA_ANON
read -p "  SUPABASE_SERVICE_ROLE_KEY: " SUPA_SERVICE
read -p "  NEXT_PUBLIC_MAPBOX_TOKEN: " MAPBOX
read -p "  STRIPE_SECRET_KEY: " STRIPE_SK
read -p "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: " STRIPE_PK

# Generate session token secret
SESSION_SECRET=$(openssl rand -base64 32)

cat > /tmp/escape-tour-env << ENVEOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPA_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPA_ANON
SUPABASE_SERVICE_ROLE_KEY=$SUPA_SERVICE

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=$MAPBOX

# Stripe
STRIPE_SECRET_KEY=$STRIPE_SK
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PK
STRIPE_WEBHOOK_SECRET=$STRIPE_WH

# Resend
RESEND_API_KEY=$RESEND_KEY
EMAIL_FROM=Escape Tour Warnemuende <noreply@escape-tour-warnemuende.de>
CONTACT_EMAIL=info@escape-tour-warnemuende.de

# App
NEXT_PUBLIC_APP_URL=https://escape-tour-warnemuende.de
NODE_ENV=production
SESSION_TOKEN_SECRET=$SESSION_SECRET
ENVEOF

echo ""
echo "  .env Datei erstellt. Kopiere auf Server..."
scp -i "$SSH_KEY" /tmp/escape-tour-env "$SERVER:$APP_PATH/.env"
rm /tmp/escape-tour-env

echo "  -> .env auf Server geschrieben!"

# ---------------------------------------------------------------------------
# 5. Deploy
# ---------------------------------------------------------------------------
echo ""
echo "--- SCHRITT 5: Deploy ---"
echo ""
echo "  Baue und starte die App auf dem Server..."

ssh -i "$SSH_KEY" "$SERVER" "cd $APP_PATH && git pull origin master && npx turbo build --filter=@escape-tour/web && pm2 delete all 2>/dev/null; fuser -k 3000/tcp 2>/dev/null; sleep 1 && pm2 start ecosystem.config.cjs && pm2 save"

echo ""
echo "=== Setup abgeschlossen! ==="
echo ""
echo "  App laeuft auf: http://116.203.57.207:3000"
echo "  Naechster Schritt: Domain DNS + SSL (certbot --nginx)"
echo ""
