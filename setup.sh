#!/usr/bin/env bash
# =============================================================================
# GSD Onboarding/Offboarding — First-time setup script (Linux / macOS)
# =============================================================================
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   GSD Onboarding/Offboarding — Setup             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Check Docker ──────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo -e "${RED}✗ Docker not found.${NC}"
  echo "  Install Docker Desktop: https://www.docker.com/products/docker-desktop"
  exit 1
fi
echo -e "${GREEN}✓ Docker found:${NC} $(docker --version)"

# ── 2. Check docker compose ──────────────────────────────────────────────────
if ! docker compose version &>/dev/null; then
  echo -e "${RED}✗ docker compose plugin not found.${NC}"
  echo "  Update Docker Desktop or install the compose plugin."
  exit 1
fi
echo -e "${GREEN}✓ Docker Compose found:${NC} $(docker compose version --short)"

# ── 3. Create .env from example ──────────────────────────────────────────────
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ .env created from .env.example${NC}"
  echo -e "${YELLOW}  ⚠ Open .env and fill in your SLACK_BOT_TOKEN, SLACK_APP_TOKEN,${NC}"
  echo -e "${YELLOW}    GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY and other credentials.${NC}"
else
  echo -e "${GREEN}✓ .env already exists — skipped${NC}"
fi

# ── 4. Create storage directories ────────────────────────────────────────────
mkdir -p hub/storage/{db,logs,uploads,cache}
mkdir -p slack-bot/storage/{db,logs}
touch hub/storage/cache/.gitkeep
touch hub/storage/uploads/.gitkeep
echo -e "${GREEN}✓ Storage directories ready${NC}"

# ── 5. Summary ───────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN} Setup complete!${NC}"
echo ""
echo "  Next steps:"
echo "  1. Edit .env with your real credentials"
echo "  2. Run:  docker compose up -d --build"
echo "  3. Hub:  http://localhost:8081"
echo "  4. Bot:  connects to Slack via Socket Mode automatically"
echo ""
echo "  For hot-reload dev mode:"
echo "  docker compose -f docker-compose.yml -f docker-compose.dev.yml up"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
