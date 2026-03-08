#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# BPM CTRL — Ubuntu VPS Deployment Script
# Deploys a Vite/React static site with Nginx, SSL (Certbot),
# and optional Supabase env vars.
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
info "Updating system packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq nginx certbot python3-certbot-nginx curl unzip git

# Install Node.js 20 via NodeSource if not present
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
  info "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y -qq nodejs
fi

# Install bun for faster builds (optional, falls back to npm)
if ! command -v bun &>/dev/null; then
  info "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi

# ─── Build the project ────────────────────────────────────────
info "Installing dependencies..."
cd "$REPO_DIR"

# Write env file
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
info "Configuring Nginx..."
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
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
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
  # ─── SSL with Certbot ─────────────────────────────────────
  info "Obtaining SSL certificate..."
  sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$CERT_EMAIL" --agree-tos --non-interactive --redirect

  info "Setting up auto-renewal..."
  sudo systemctl enable certbot.timer
  sudo systemctl start certbot.timer
else
  warn "Skipped SSL. Run later: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# ─── UFW Firewall ─────────────────────────────────────────────
if command -v ufw &>/dev/null; then
  info "Configuring firewall..."
  sudo ufw allow 'Nginx Full' >/dev/null 2>&1
  sudo ufw allow OpenSSH >/dev/null 2>&1
  sudo ufw --force enable >/dev/null 2>&1
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
info "To redeploy after changes:"
info "  cd $REPO_DIR && git pull && bash deploy.sh"
echo ""
