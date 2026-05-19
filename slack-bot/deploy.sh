#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
#  deploy.sh — Despliega el HR Bot en Hostinger VPS
#
#  Ejecutar desde tu Mac (en el directorio raíz del proyecto):
#    chmod +x slack-bot/deploy.sh
#    ./slack-bot/deploy.sh
#
#  Primera vez:   ./slack-bot/deploy.sh --setup
#  Actualizar:    ./slack-bot/deploy.sh
# ══════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Configuración ─────────────────────────────────────────────────
SSH_USER="u548288135"
SSH_HOST="145.223.106.13"
SSH_PORT="65002"
REMOTE_DIR="/home/${SSH_USER}/hr-bot"
SSH_OPTS="-p ${SSH_PORT} -o StrictHostKeyChecking=no -o ConnectTimeout=20"
BRANCH="main"

# ── Colores ───────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

log()  { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }
step() { echo -e "\n${BOLD}${BLUE}▶ $1${NC}"; }

SSH_CMD="ssh ${SSH_OPTS} ${SSH_USER}@${SSH_HOST}"
SCP_CMD="scp -P ${SSH_PORT} -o StrictHostKeyChecking=no"

# ══════════════════════════════════════════════════════════════════
#  SETUP COMPLETO (primera vez): ./deploy.sh --setup
# ══════════════════════════════════════════════════════════════════
if [[ "${1:-}" == "--setup" ]]; then
  echo -e "\n${BOLD}🚀 Setup inicial del servidor Hostinger${NC}\n"

  step "1/7 — Verificando conexión SSH"
  $SSH_CMD "echo '✓ Conexión exitosa'" || err "No se pudo conectar al servidor"

  step "2/7 — Instalando Node.js 20 y PM2"
  $SSH_CMD bash << 'ENDSSH'
    set -e
    # Node.js 20 via NodeSource
    if ! command -v node &>/dev/null || [[ "$(node --version | cut -d. -f1 | tr -d 'v')" -lt 20 ]]; then
      echo "→ Instalando Node.js 20..."
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      sudo apt-get install -y nodejs
    fi
    echo "Node: $(node --version)"
    echo "NPM:  $(npm --version)"

    # PM2
    if ! command -v pm2 &>/dev/null; then
      echo "→ Instalando PM2..."
      sudo npm install -g pm2
    fi
    echo "PM2:  $(pm2 --version)"
ENDSSH
  log "Node.js 20 y PM2 listos"

  step "3/7 — Instalando Nginx y Certbot"
  $SSH_CMD bash << 'ENDSSH'
    set -e
    if ! command -v nginx &>/dev/null; then
      sudo apt-get update -qq
      sudo apt-get install -y nginx
    fi
    if ! command -v certbot &>/dev/null; then
      sudo apt-get install -y certbot python3-certbot-nginx
    fi
    sudo systemctl enable nginx
    sudo systemctl start nginx
    echo "Nginx: $(nginx -v 2>&1)"
ENDSSH
  log "Nginx y Certbot listos"

  step "4/7 — Creando directorio del proyecto"
  $SSH_CMD "mkdir -p ${REMOTE_DIR}/storage/{db,logs} && echo '✓ Directorios creados'"

  step "5/7 — Subiendo código fuente"
  # Excluye node_modules, .env, storage/db y archivos de dev
  rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='storage/db/*.sqlite' \
    --exclude='storage/logs' \
    --exclude='.git' \
    --exclude='preview' \
    --exclude='tests' \
    --exclude=':memory:' \
    -e "ssh ${SSH_OPTS}" \
    "$(dirname "$0")/" \
    "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/"
  log "Código subido"

  step "6/7 — Configurando .env en el servidor"
  # Verificar si ya existe .env en el servidor
  ENV_EXISTS=$($SSH_CMD "test -f ${REMOTE_DIR}/.env && echo yes || echo no")
  if [[ "$ENV_EXISTS" == "no" ]]; then
    warn ".env NO existe en el servidor"
    echo ""
    echo -e "${YELLOW}  Debes crear el archivo .env en el servidor:${NC}"
    echo -e "  ${BOLD}ssh ${SSH_OPTS} ${SSH_USER}@${SSH_HOST}${NC}"
    echo -e "  ${BOLD}cp ${REMOTE_DIR}/.env.production ${REMOTE_DIR}/.env${NC}"
    echo -e "  ${BOLD}nano ${REMOTE_DIR}/.env${NC}   ← completar con tus tokens reales"
    echo ""
    read -p "¿Ya configuraste el .env? [s/N]: " confirm
    [[ "$confirm" =~ ^[sS]$ ]] || { warn "Deploy pausado. Configura el .env y vuelve a ejecutar sin --setup"; exit 0; }
  else
    log ".env ya existe en el servidor"
  fi

  step "7/7 — Instalando dependencias y arrancando PM2"
  $SSH_CMD bash << ENDSSH
    set -e
    cd ${REMOTE_DIR}
    npm ci --omit=dev
    mkdir -p storage/db storage/logs

    # Configurar Nginx
    sudo cp nginx.conf /etc/nginx/sites-available/hr-bot
    sudo ln -sf /etc/nginx/sites-available/hr-bot /etc/nginx/sites-enabled/hr-bot
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx

    # Arrancar con PM2
    pm2 delete onboarding-bot 2>/dev/null || true
    pm2 start ecosystem.config.cjs --env production
    pm2 save
    pm2 startup | tail -1 | sudo bash || true

    echo ""
    echo "✓ Bot arrancado"
    pm2 list
ENDSSH

  echo ""
  echo -e "${GREEN}${BOLD}════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}${BOLD}  ✅ Setup completo!${NC}"
  echo -e "${GREEN}${BOLD}════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "  ${BOLD}Próximo paso — SSL:${NC}"
  echo -e "  ${BOLD}ssh ${SSH_OPTS} ${SSH_USER}@${SSH_HOST}${NC}"
  echo -e "  ${BOLD}sudo certbot --nginx -d bot.gsdoutsources.com${NC}"
  echo ""
  echo -e "  ${BOLD}URL del bot:${NC} https://bot.gsdoutsources.com/slack/events"
  echo -e "  (Pega esta URL en: api.slack.com → Event Subscriptions → Request URL)"
  echo ""
  exit 0
fi

# ══════════════════════════════════════════════════════════════════
#  ACTUALIZACIÓN (uso normal, sin --setup)
# ══════════════════════════════════════════════════════════════════
echo -e "\n${BOLD}🔄 Actualizando HR Bot en Hostinger${NC}\n"

step "Verificando conexión"
$SSH_CMD "echo '✓ Conexión OK'" || err "Sin conexión al servidor"

step "Sincronizando código"
rsync -avz --progress \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='storage/db/*.sqlite' \
  --exclude='storage/logs' \
  --exclude='.git' \
  --exclude='preview' \
  --exclude='tests' \
  --exclude=':memory:' \
  -e "ssh ${SSH_OPTS}" \
  "$(dirname "$0")/" \
  "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/"
log "Código sincronizado"

step "Actualizando dependencias y reiniciando"
$SSH_CMD bash << ENDSSH
  set -e
  cd ${REMOTE_DIR}
  npm ci --omit=dev
  pm2 restart onboarding-bot --env production
  pm2 list
  echo ""
  echo "Health check:"
  sleep 2
  curl -sf http://localhost:3000/healthz && echo " ✓ Bot respondiendo OK" || echo " ⚠ Health check falló (revisar logs)"
ENDSSH

echo ""
echo -e "${GREEN}${BOLD}✅ Actualización completa${NC}"
echo -e "  Logs:  ${BOLD}ssh ${SSH_OPTS} ${SSH_USER}@${SSH_HOST} 'pm2 logs onboarding-bot --lines 50'${NC}"
