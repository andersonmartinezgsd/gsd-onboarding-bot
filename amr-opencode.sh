#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# AMR Tech — OpenCode Smart Launcher con Fallback de Modelos
# ═══════════════════════════════════════════════════════════════
# Uso:
#   amr-opencode                    → Lanza con modelo por defecto (Qwen3 local)
#   amr-opencode --cloud            → Lanza con OpenAI (gpt-5.1)
#   amr-opencode --model X          → Lanza con modelo específico
#   amr-opencode --agent super      → Lanza agente específico
#   amr-opencode --project /ruta    → Lanza en proyecto específico
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colores ──────────────────────────────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

# ── Cadena de fallback (orden de prioridad) ──────────────────
# Nivel 1: Modelos locales (gratis, sin límites)
# Nivel 2: OpenCode Zen (créditos limitados)
# Nivel 3: OpenAI API (de pago)
LOCAL_MODELS=("qwen3-coder" "deepseek-r1" "llama3.1" "codellama")
CLOUD_MODELS=("opencode/big-pickle" "opencode/claude-sonnet-4-6" "openai/gpt-5.1")

# ── Defaults ─────────────────────────────────────────────────
MODEL=""
AGENT="superorchestrator"
PROJECT=""
USE_CLOUD=false
EXTRA_ARGS=""

# ── Parse args ───────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --cloud)      USE_CLOUD=true; shift ;;
    --model|-m)   MODEL="$2"; shift 2 ;;
    --agent|-a)   AGENT="$2"; shift 2 ;;
    --project|-p) PROJECT="$2"; shift 2 ;;
    --help|-h)
      echo -e "${CYAN}═══ AMR OpenCode Launcher ═══${NC}"
      echo ""
      echo "  amr-opencode                      Lanza con Qwen3 local"
      echo "  amr-opencode --cloud              Lanza con modelo cloud"
      echo "  amr-opencode --model ollama/X     Modelo específico"
      echo "  amr-opencode --agent php-architect Agente específico"
      echo "  amr-opencode --project /ruta      En proyecto específico"
      echo ""
      echo -e "${YELLOW}Modelos locales disponibles:${NC}"
      echo "  ollama/qwen3-coder    ← Recomendado (tool calling)"
      echo "  ollama/deepseek-r1    ← Razonamiento profundo"
      echo "  ollama/llama3.1       ← General purpose"
      echo "  ollama/codellama      ← Solo código"
      echo ""
      echo -e "${PURPLE}Modelos cloud disponibles:${NC}"
      echo "  opencode/big-pickle         ← OpenCode Zen gratis"
      echo "  opencode/claude-sonnet-4-6  ← Claude via Zen"
      echo "  openai/gpt-5.1             ← OpenAI (requiere API key)"
      echo ""
      echo -e "${GREEN}Agentes disponibles:${NC}"
      echo "  superorchestrator  php-architect  dba  uiux"
      echo "  security  hostinger-devops  documenter"
      echo "  gitmaster  api-integrator  qa-tester"
      exit 0
      ;;
    *) EXTRA_ARGS="$EXTRA_ARGS $1"; shift ;;
  esac
done

# ── Verificar Ollama está corriendo ──────────────────────────
check_ollama() {
  if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# ── Verificar modelo existe en Ollama ────────────────────────
check_ollama_model() {
  local model_name="$1"
  # Mapear nombres de opencode a nombres de ollama
  case "$model_name" in
    "qwen3-coder") local ollama_name="qwen3:8b" ;;
    *)             local ollama_name="$model_name" ;;
  esac

  ollama list 2>/dev/null | grep -q "$ollama_name"
  return $?
}

# ── Encontrar primer modelo local disponible ─────────────────
find_local_model() {
  for model in "${LOCAL_MODELS[@]}"; do
    if check_ollama_model "$model"; then
      echo "$model"
      return 0
    fi
  done
  return 1
}

# ── Banner ───────────────────────────────────────────────────
echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║     AMR Tech · OpenCode Smart Launcher        ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Seleccionar modelo ───────────────────────────────────────
if [[ -n "$MODEL" ]]; then
  # Usuario especificó modelo
  SELECTED_MODEL="$MODEL"
  echo -e "${GREEN}▸ Modelo seleccionado manualmente:${NC} $SELECTED_MODEL"

elif [[ "$USE_CLOUD" == true ]]; then
  # Modo cloud
  SELECTED_MODEL="${CLOUD_MODELS[0]}"
  echo -e "${PURPLE}▸ Modo CLOUD:${NC} $SELECTED_MODEL"

else
  # Auto-detect: intentar local primero
  if check_ollama; then
    echo -e "${GREEN}✓ Ollama detectado en localhost:11434${NC}"

    LOCAL_MODEL=$(find_local_model)
    if [[ -n "$LOCAL_MODEL" ]]; then
      SELECTED_MODEL="ollama/$LOCAL_MODEL"
      echo -e "${GREEN}▸ Modelo LOCAL:${NC} $SELECTED_MODEL (gratis, sin límites)"
    else
      echo -e "${YELLOW}⚠ No hay modelos locales compatibles. Descarga uno:${NC}"
      echo -e "  ollama pull qwen3:8b"
      echo ""
      echo -e "${YELLOW}▸ Fallback a CLOUD:${NC} ${CLOUD_MODELS[0]}"
      SELECTED_MODEL="${CLOUD_MODELS[0]}"
    fi
  else
    echo -e "${YELLOW}⚠ Ollama no está corriendo. Iniciando...${NC}"
    ollama serve &>/dev/null &
    sleep 2

    if check_ollama; then
      LOCAL_MODEL=$(find_local_model)
      if [[ -n "$LOCAL_MODEL" ]]; then
        SELECTED_MODEL="ollama/$LOCAL_MODEL"
        echo -e "${GREEN}▸ Ollama iniciado. Modelo LOCAL:${NC} $SELECTED_MODEL"
      else
        SELECTED_MODEL="${CLOUD_MODELS[0]}"
        echo -e "${YELLOW}▸ Fallback a CLOUD:${NC} $SELECTED_MODEL"
      fi
    else
      SELECTED_MODEL="${CLOUD_MODELS[0]}"
      echo -e "${RED}✗ No se pudo iniciar Ollama. Usando CLOUD:${NC} $SELECTED_MODEL"
    fi
  fi
fi

# ── Info del agente ──────────────────────────────────────────
echo -e "${PURPLE}▸ Agente:${NC} $AGENT"
if [[ -n "$PROJECT" ]]; then
  echo -e "${CYAN}▸ Proyecto:${NC} $PROJECT"
fi
echo ""

# ── Construir comando ────────────────────────────────────────
CMD="opencode"
CMD="$CMD --model $SELECTED_MODEL"
CMD="$CMD --agent $AGENT"

if [[ -n "$PROJECT" ]]; then
  CMD="$CMD $PROJECT"
fi

if [[ -n "$EXTRA_ARGS" ]]; then
  CMD="$CMD $EXTRA_ARGS"
fi

echo -e "${CYAN}▸ Ejecutando:${NC} $CMD"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo ""

# ── Ejecutar ─────────────────────────────────────────────────
exec $CMD
