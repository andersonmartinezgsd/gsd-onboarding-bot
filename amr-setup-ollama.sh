#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# AMR Tech — Setup Ollama Models para OpenCode
# Ejecutar UNA VEZ después de instalar Ollama
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

FRAMEWORK_DIR="$(cd "$(dirname "$0")" && pwd)"
MODELS_DIR="$FRAMEWORK_DIR/ollama-models"

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║   AMR Tech · Ollama Models Setup              ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# ── 1. Verificar Ollama ──────────────────────────────────────
if ! command -v ollama &> /dev/null; then
  echo -e "${RED}✗ Ollama no está instalado.${NC}"
  echo "  Instalar: brew install ollama"
  exit 1
fi

if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
  echo -e "${YELLOW}▸ Iniciando Ollama...${NC}"
  ollama serve &>/dev/null &
  sleep 3
fi

echo -e "${GREEN}✓ Ollama corriendo${NC}"

# ── 2. Descargar modelos base si no existen ──────────────────
echo ""
echo -e "${CYAN}═══ Descargando modelos base ═══${NC}"

MODELS_TO_PULL=("qwen3:8b")

for model in "${MODELS_TO_PULL[@]}"; do
  if ollama list | grep -q "$model"; then
    echo -e "${GREEN}✓ $model ya existe${NC}"
  else
    echo -e "${YELLOW}▸ Descargando $model...${NC}"
    ollama pull "$model"
    echo -e "${GREEN}✓ $model descargado${NC}"
  fi
done

# ── 3. Crear modelos AMR con contexto expandido ──────────────
echo ""
echo -e "${CYAN}═══ Creando modelos AMR (contexto expandido) ═══${NC}"

if [[ -f "$MODELS_DIR/Modelfile.qwen3-coder" ]]; then
  echo -e "${YELLOW}▸ Creando qwen3-coder (32K contexto)...${NC}"
  ollama create qwen3-coder -f "$MODELS_DIR/Modelfile.qwen3-coder"
  echo -e "${GREEN}✓ qwen3-coder creado${NC}"
fi

if [[ -f "$MODELS_DIR/Modelfile.deepseek-coder" ]]; then
  if ollama list | grep -q "deepseek-r1"; then
    echo -e "${YELLOW}▸ Creando deepseek-coder (16K contexto)...${NC}"
    ollama create deepseek-coder -f "$MODELS_DIR/Modelfile.deepseek-coder"
    echo -e "${GREEN}✓ deepseek-coder creado${NC}"
  else
    echo -e "${YELLOW}⚠ deepseek-r1 no instalado, saltando deepseek-coder${NC}"
  fi
fi

# ── 4. Configurar alias global ───────────────────────────────
echo ""
echo -e "${CYAN}═══ Configurando aliases ═══${NC}"

SHELL_RC="$HOME/.zshrc"
if [[ ! -f "$SHELL_RC" ]]; then
  SHELL_RC="$HOME/.bashrc"
fi

# Verificar si ya existe
if grep -q "amr-opencode" "$SHELL_RC" 2>/dev/null; then
  echo -e "${GREEN}✓ Alias amr-opencode ya existe en $SHELL_RC${NC}"
else
  cat >> "$SHELL_RC" << 'ALIASES'

# ═══ AMR Tech — OpenCode Aliases ═══
alias amr-opencode="/Users/andersonmartinezrestrepo/DEV-PROJECTS/Framework/amr-opencode.sh"
alias amr-oc="amr-opencode"
alias amr-oc-cloud="amr-opencode --cloud"
alias amr-td="amr-opencode --project /Users/andersonmartinezrestrepo/GSD/td-dashboard"
ALIASES
  echo -e "${GREEN}✓ Aliases agregados a $SHELL_RC${NC}"
  echo -e "${YELLOW}  Ejecuta: source $SHELL_RC${NC}"
fi

# ── 5. Verificar todo ────────────────────────────────────────
echo ""
echo -e "${CYAN}═══ Modelos disponibles ═══${NC}"
ollama list

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Setup completo                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Uso:${NC}"
echo "  amr-opencode                         → Qwen3 local (gratis)"
echo "  amr-opencode --cloud                 → OpenCode Zen / OpenAI"
echo "  amr-opencode --model ollama/qwen3-coder --agent superorchestrator"
echo "  amr-td                               → Directo al td-dashboard"
echo ""
echo -e "${YELLOW}Para el td-dashboard:${NC}"
echo "  cd /Users/andersonmartinezrestrepo/GSD/td-dashboard"
echo "  amr-opencode --agent superorchestrator"
