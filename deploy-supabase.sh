#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# BPM CTRL — Deploy with Direct Supabase.com Project
# Deploys the frontend to Nginx with SSL, migrates data from
# Lovable Cloud to your own Supabase.com project, and updates
# the frontend to point to the new Supabase instance.
# ═══════════════════════════════════════════════════════════════

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

banner() {
  echo -e "${CYAN}"
  echo "╔══════════════════════════════════════════════════╗"
  echo "║   BPM CTRL — SUPABASE MIGRATION + DEPLOY        ║"
  echo "╚══════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── Prerequisites check ─────────────────────────────────────
check_deps() {
  for cmd in curl jq; do
    if ! command -v "$cmd" &>/dev/null; then
      error "$cmd is required but not installed. Install it first."
    fi
  done
}

banner
check_deps

# ─── Gather deployment info ──────────────────────────────────
echo -e "${CYAN}=== Domain & SSL ===${NC}"
read -rp "Domain name (e.g. bpmctrl.com): " DOMAIN
[[ -z "$DOMAIN" ]] && error "Domain is required."

read -rp "Email for Certbot / Let's Encrypt SSL: " CERT_EMAIL
[[ -z "$CERT_EMAIL" ]] && error "Email is required for SSL."

echo ""
echo -e "${CYAN}=== Lovable Cloud (Source — current database) ===${NC}"
echo -e "These are your current Lovable Cloud credentials."
echo -e "You can find them in your .env file or Lovable project settings."
echo ""
read -rp "Lovable Cloud Supabase URL: " OLD_SUPABASE_URL
read -rp "Lovable Cloud Supabase anon key: " OLD_SUPABASE_KEY
read -rp "Lovable Cloud Supabase service role key: " OLD_SERVICE_ROLE_KEY

echo ""
echo -e "${CYAN}=== New Supabase.com Project (Destination) ===${NC}"
echo -e "Create a project at ${CYAN}https://supabase.com/dashboard${NC}"
echo -e "Then grab these from Settings → API in the Supabase dashboard."
echo ""
read -rp "New Supabase URL (e.g. https://xxxx.supabase.co): " NEW_SUPABASE_URL
read -rp "New Supabase anon key: " NEW_SUPABASE_KEY
read -rp "New Supabase service role key: " NEW_SERVICE_ROLE_KEY
read -rp "New Supabase DB connection string (postgres://...): " NEW_DB_URL

[[ -z "$NEW_SUPABASE_URL" || -z "$NEW_SUPABASE_KEY" || -z "$NEW_SERVICE_ROLE_KEY" || -z "$NEW_DB_URL" ]] && \
  error "All new Supabase credentials are required."

DEPLOY_DIR="/var/www/${DOMAIN}"
REPO_DIR="$(pwd)"
MIGRATION_DIR="${REPO_DIR}/supabase/migrations"

echo ""
info "Domain:            $DOMAIN"
info "Old Supabase URL:  $OLD_SUPABASE_URL"
info "New Supabase URL:  $NEW_SUPABASE_URL"
info "Deploy dir:        $DEPLOY_DIR"
echo ""
read -rp "Continue? (y/N): " CONFIRM
[[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]] && { info "Aborted."; exit 0; }

# ─── Step 1: Apply schema migrations to new Supabase ─────────
echo ""
echo -e "${CYAN}═══ STEP 1: Schema Migration ═══${NC}"
info "Applying schema migrations to the new Supabase project..."

# Create the app_role enum and core tables
info "Creating enums, tables, functions, and policies..."

psql "$NEW_DB_URL" <<'SCHEMA_SQL'
-- ═══════════════════════════════════════════════════════════
-- BPM CTRL — Full schema setup
-- ═══════════════════════════════════════════════════════════

-- 1. Enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Tables
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.site_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  public_url text NOT NULL,
  storage_path text NOT NULL,
  section text NOT NULL,
  asset_type text NOT NULL DEFAULT 'image',
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. Trigger
DROP TRIGGER IF EXISTS update_site_assets_updated_at ON public.site_assets;
CREATE TRIGGER update_site_assets_updated_at
  BEFORE UPDATE ON public.site_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_assets ENABLE ROW LEVEL SECURITY;

-- user_roles policies
DO $$ BEGIN
  CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- site_assets policies
DO $$ BEGIN
  CREATE POLICY "Admins can manage site assets"
    ON public.site_assets FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can read all site assets"
    ON public.site_assets FOR SELECT
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Site assets are publicly readable"
    ON public.site_assets FOR SELECT
    TO anon, authenticated
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

SCHEMA_SQL

info "✅ Schema applied successfully."

# ─── Step 2: Migrate data from Lovable Cloud ─────────────────
echo ""
echo -e "${CYAN}═══ STEP 2: Data Migration ═══${NC}"
info "Exporting site_assets from Lovable Cloud..."

# Export data using the old Supabase REST API (service role for full access)
ASSETS_JSON=$(curl -s \
  -H "apikey: ${OLD_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${OLD_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  "${OLD_SUPABASE_URL}/rest/v1/site_assets?select=*&order=sort_order.asc" \
)

ASSET_COUNT=$(echo "$ASSETS_JSON" | jq 'length')
info "Found ${ASSET_COUNT} assets to migrate."

if [[ "$ASSET_COUNT" -gt 0 ]]; then
  info "Importing site_assets into new Supabase..."
  
  # Import via REST API with upsert (conflict on id)
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "apikey: ${NEW_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${NEW_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates" \
    "${NEW_SUPABASE_URL}/rest/v1/site_assets" \
    -d "$ASSETS_JSON" \
  )

  if [[ "$HTTP_STATUS" -ge 200 && "$HTTP_STATUS" -lt 300 ]]; then
    info "✅ ${ASSET_COUNT} assets migrated successfully."
  else
    warn "Asset import returned HTTP ${HTTP_STATUS}. Check the new Supabase dashboard for details."
  fi
else
  info "No assets to migrate — skipping."
fi

# ─── Step 3: Migrate storage files ───────────────────────────
echo ""
echo -e "${CYAN}═══ STEP 3: Storage Migration ═══${NC}"
info "Migrating files from site-assets bucket..."

# List files in old bucket
FILES_JSON=$(curl -s \
  -H "apikey: ${OLD_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${OLD_SERVICE_ROLE_KEY}" \
  "${OLD_SUPABASE_URL}/storage/v1/object/list/site-assets" \
  -d '{"prefix":"","limit":1000}' \
  -H "Content-Type: application/json" \
)

FILE_COUNT=$(echo "$FILES_JSON" | jq 'length // 0')
info "Found ${FILE_COUNT} files to migrate."

if [[ "$FILE_COUNT" -gt 0 ]]; then
  TEMP_DIR=$(mktemp -d)
  info "Downloading files to ${TEMP_DIR}..."

  echo "$FILES_JSON" | jq -r '.[].name // empty' | while IFS= read -r FILE_NAME; do
    [[ -z "$FILE_NAME" ]] && continue
    info "  Downloading: ${FILE_NAME}"
    curl -s \
      -H "apikey: ${OLD_SERVICE_ROLE_KEY}" \
      -H "Authorization: Bearer ${OLD_SERVICE_ROLE_KEY}" \
      "${OLD_SUPABASE_URL}/storage/v1/object/site-assets/${FILE_NAME}" \
      -o "${TEMP_DIR}/${FILE_NAME}"

    info "  Uploading:   ${FILE_NAME}"
    curl -s \
      -X POST \
      -H "apikey: ${NEW_SERVICE_ROLE_KEY}" \
      -H "Authorization: Bearer ${NEW_SERVICE_ROLE_KEY}" \
      -H "Content-Type: application/octet-stream" \
      -H "x-upsert: true" \
      "${NEW_SUPABASE_URL}/storage/v1/object/site-assets/${FILE_NAME}" \
      --data-binary "@${TEMP_DIR}/${FILE_NAME}" \
      -o /dev/null
  done

  rm -rf "$TEMP_DIR"
  info "✅ Storage files migrated."
else
  info "No files to migrate — skipping."
fi

# ─── Step 4: Migrate user_roles ──────────────────────────────
echo ""
echo -e "${CYAN}═══ STEP 4: User Roles Migration ═══${NC}"
warn "User roles reference auth.users IDs which won't match between projects."
warn "You'll need to:"
warn "  1. Create admin user(s) in the new Supabase project (Auth → Users)"
warn "  2. Then manually insert roles:"
warn "     INSERT INTO user_roles (user_id, role) VALUES ('<new-user-id>', 'admin');"
echo ""

# ─── Step 5: System dependencies ─────────────────────────────
echo ""
echo -e "${CYAN}═══ STEP 5: System Setup ═══${NC}"
info "Updating system packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq nginx certbot python3-certbot-nginx curl unzip git

# Install Node.js 20 if needed
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
  info "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y -qq nodejs
fi

# Install bun
if ! command -v bun &>/dev/null; then
  info "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi

# ─── Step 6: Build the project ───────────────────────────────
echo ""
echo -e "${CYAN}═══ STEP 6: Build ═══${NC}"
info "Writing .env.production with NEW Supabase credentials..."
cd "$REPO_DIR"

cat > .env.production <<EOF
VITE_SUPABASE_URL=${NEW_SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${NEW_SUPABASE_KEY}
EOF

info "Installing dependencies..."
if command -v bun &>/dev/null; then
  bun install --frozen-lockfile 2>/dev/null || bun install
  info "Building with Bun..."
  bun run build
else
  npm ci 2>/dev/null || npm install
  info "Building with npm..."
  npm run build
fi

# ─── Step 7: Deploy to Nginx ─────────────────────────────────
echo ""
echo -e "${CYAN}═══ STEP 7: Nginx Deploy ═══${NC}"
info "Deploying to $DEPLOY_DIR..."
sudo mkdir -p "$DEPLOY_DIR"
sudo rm -rf "${DEPLOY_DIR:?}/"*
sudo cp -r dist/* "$DEPLOY_DIR/"

# Nginx config
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

# ─── Step 8: DNS + SSL ───────────────────────────────────────
echo ""
echo -e "${CYAN}═══ STEP 8: DNS & SSL ═══${NC}"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
warn "═══════════════════════════════════════════════════════════"
warn "  Point your domain to this server:"
warn "  A     @     →  $SERVER_IP"
warn "  A     www   →  $SERVER_IP"
warn "═══════════════════════════════════════════════════════════"
echo ""
read -rp "Press Enter once DNS is pointed (or 'skip' to skip SSL)... " DNS_CONFIRM

if [[ "$DNS_CONFIRM" != "skip" ]]; then
  info "Obtaining SSL certificate..."
  sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$CERT_EMAIL" --agree-tos --non-interactive --redirect
  sudo systemctl enable certbot.timer
  sudo systemctl start certbot.timer
else
  warn "Skipped SSL. Run later: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# ─── Step 9: Firewall ────────────────────────────────────────
if command -v ufw &>/dev/null; then
  info "Configuring firewall..."
  sudo ufw allow 'Nginx Full' >/dev/null 2>&1
  sudo ufw allow OpenSSH >/dev/null 2>&1
  sudo ufw --force enable >/dev/null 2>&1
fi

# ─── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     MIGRATION + DEPLOYMENT COMPLETE! 🎛️          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
info "Site:  https://$DOMAIN"
info "Admin: https://$DOMAIN/admin/login"
echo ""
warn "IMPORTANT — Post-migration checklist:"
echo "  1. Create your admin user in Supabase dashboard → Authentication → Users"
echo "  2. Assign admin role:"
echo "     INSERT INTO user_roles (user_id, role) VALUES ('<user-id>', 'admin');"
echo "  3. In Auth settings, set Site URL to: https://$DOMAIN"
echo "  4. Add Redirect URLs:"
echo "     - https://$DOMAIN"
echo "     - https://$DOMAIN/admin/login"
echo "     - https://www.$DOMAIN"
echo "     - https://www.$DOMAIN/admin/login"
echo "  5. Verify site_assets loaded: https://$DOMAIN"
echo "  6. Test admin login:         https://$DOMAIN/admin/login"
echo "  7. Update public_url values in site_assets if storage URLs changed"
echo ""
info "To redeploy frontend only:"
info "  cd $REPO_DIR && git pull && bun run build && sudo cp -r dist/* $DEPLOY_DIR/"
echo ""
