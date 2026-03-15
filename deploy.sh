#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# BPM CTRL — Ubuntu VPS Deployment Script
# Deploys a Vite/React static site with Nginx + SSL.
# ⚠️  Safe for co-hosting alongside other apps (e.g. Node/PM2).
#     - Does NOT remove other Nginx site configs
#     - Does NOT upgrade Node.js if already installed
#     - Does NOT force-reset UFW firewall
# ═══════════════════════════════════════════════════════════════

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

banner() {
  echo -e "${CYAN}"
  echo "╔═══════════════════════════════════════════╗"
  echo "║        BPM CTRL — DEPLOY SCRIPT           ║"
  echo "╚═══════════════════════════════════════════╝"
  echo -e "${NC}"
}

info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── Gather deployment info ───────────────────────────────────
banner

read -rp "Domain name (e.g. bpmctrl.com): " DOMAIN
[[ -z "$DOMAIN" ]] && error "Domain is required."

read -rp "Email for Certbot / Let's Encrypt SSL: " CERT_EMAIL
[[ -z "$CERT_EMAIL" ]] && error "Email is required for SSL."

read -rp "Supabase URL (VITE_SUPABASE_URL): " SUPABASE_URL
read -rp "Supabase anon key (VITE_SUPABASE_PUBLISHABLE_KEY): " SUPABASE_KEY

# Validate credentials early to catch URL/key mismatch (common cause of auth fetch failures)
AUTH_CHECK_STATUS=$(curl -s -o /tmp/bpmctrl-auth-check.json -w "%{http_code}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  "${SUPABASE_URL}/auth/v1/settings" || true)

if [[ "$AUTH_CHECK_STATUS" -lt 200 || "$AUTH_CHECK_STATUS" -ge 300 ]]; then
  warn "Auth preflight check failed (HTTP $AUTH_CHECK_STATUS)."
  warn "This usually means URL/key mismatch and can cause signup/login 'Failed to fetch' on VPS."
else
  info "Auth preflight check passed."
fi

DEPLOY_DIR="/var/www/${DOMAIN}"
REPO_DIR="$(pwd)"

echo ""
info "Domain:      $DOMAIN"
info "Cert email:  $CERT_EMAIL"
info "Deploy dir:  $DEPLOY_DIR"
echo ""
read -rp "Continue? (y/N): " CONFIRM
[[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]] && { info "Aborted."; exit 0; }

# ─── System dependencies ──────────────────────────────────────
info "Installing required packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq nginx certbot python3-certbot-nginx curl unzip git

# Install Node.js ONLY if not already present — preserves existing version
# needed by other apps on this VPS (e.g. khalspuppeteer uses Node 18).
if ! command -v node &>/dev/null; then
  info "No Node.js found — installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y -qq nodejs
else
  info "Node.js $(node -v) already installed — keeping existing version."
fi

# Install bun for faster builds (falls back to npm)
if ! command -v bun &>/dev/null; then
  info "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi

# ─── Build the project ────────────────────────────────────────
info "Installing dependencies..."
cd "$REPO_DIR"

cat > .env.production <<EOF
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${SUPABASE_KEY}
EOF

if command -v bun &>/dev/null; then
  bun install --frozen-lockfile 2>/dev/null || bun install
  info "Building with Bun..."
  bun run build
else
  npm ci 2>/dev/null || npm install
  info "Building with npm..."
  npm run build
fi

# ─── Deploy to Nginx ──────────────────────────────────────────
info "Deploying to $DEPLOY_DIR..."
sudo mkdir -p "$DEPLOY_DIR"
sudo rm -rf "${DEPLOY_DIR:?}/"*
sudo cp -r dist/* "$DEPLOY_DIR/"

# ─── Nginx config ─────────────────────────────────────────────
# Creates a separate server block for THIS domain only.
# Does NOT touch /etc/nginx/sites-enabled/default or other site configs.
info "Configuring Nginx for $DOMAIN..."
sudo tee /etc/nginx/sites-available/"$DOMAIN" > /dev/null <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    root ${DEPLOY_DIR};
    index index.html;

    # SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;
}
NGINX

sudo ln -sf /etc/nginx/sites-available/"$DOMAIN" /etc/nginx/sites-enabled/
# ⚠️  Intentionally NOT removing /etc/nginx/sites-enabled/default or other configs
sudo nginx -t && sudo systemctl reload nginx

# ─── DNS Check ────────────────────────────────────────────────
echo ""
warn "═══════════════════════════════════════════════════════════"
warn "  MANUAL STEP REQUIRED: Point your domain to this server"
warn "═══════════════════════════════════════════════════════════"
echo ""
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
info "Server IP: $SERVER_IP"
echo ""
echo -e "  Go to your domain registrar and add these DNS records:"
echo -e "  ${CYAN}A     @     →  $SERVER_IP${NC}"
echo -e "  ${CYAN}A     www   →  $SERVER_IP${NC}"
echo ""
read -rp "Press Enter once DNS is pointed to this server (or 'skip' to skip SSL)... " DNS_CONFIRM

if [[ "$DNS_CONFIRM" != "skip" ]]; then
  info "Obtaining SSL certificate for $DOMAIN..."
  sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$CERT_EMAIL" --agree-tos --non-interactive --redirect

  info "Setting up auto-renewal..."
  sudo systemctl enable certbot.timer
  sudo systemctl start certbot.timer
else
  warn "Skipped SSL. Run later: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# ─── UFW Firewall ─────────────────────────────────────────────
# Only ADD rules — never force-reset or disable existing firewall.
if command -v ufw &>/dev/null; then
  info "Ensuring firewall allows HTTP/HTTPS..."
  sudo ufw allow 'Nginx Full' >/dev/null 2>&1 || true
  sudo ufw allow OpenSSH >/dev/null 2>&1 || true
  if ! sudo ufw status | grep -q "Status: active"; then
    sudo ufw --force enable >/dev/null 2>&1
  fi
fi

# ─── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       DEPLOYMENT COMPLETE! 🎛️              ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
info "Site: https://$DOMAIN"
info "Admin: https://$DOMAIN/admin/login"
echo ""
warn "Auth checklist (required for signup/login on VPS):"
echo "  1. In your backend auth settings, set Site URL to: https://$DOMAIN"
echo "  2. Add Redirect URLs:"
echo "     - https://$DOMAIN"
echo "     - https://$DOMAIN/admin/login"
echo "     - https://www.$DOMAIN"
echo "     - https://www.$DOMAIN/admin/login"
echo "  3. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are from the SAME project"
echo ""
info "To redeploy after changes:"
info "  cd $REPO_DIR && git pull && bun run build && sudo cp -r dist/* $DEPLOY_DIR/"
echo ""
