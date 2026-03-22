#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════╗
# ║  AMR Tech — Inicio del Sistema Multi-Agente OpenCode    ║
# ║  Motor: OpenCode CLI · 10 Agentes · PHP 8.4 · MySQL 8+  ║
# ╚══════════════════════════════════════════════════════════╝

set -euo pipefail

# ── Colores ──
G='\033[0;32m'; Y='\033[1;33m'; C='\033[0;36m'; W='\033[1;37m'; P='\033[0;35m'; NC='\033[0m'

ok()  { echo -e "${G}  ✅ $1${NC}"; }
warn(){ echo -e "${Y}  ⚠️  $1${NC}"; }
hdr() { echo -e "\n${P}══════════════════════════════════════${NC}"; echo -e "${W}  $1${NC}"; echo -e "${P}══════════════════════════════════════${NC}"; }

clear
echo -e "${P}"
cat << 'BANNER'
 █████╗ ███╗   ███╗██████╗     ████████╗███████╗ ██████╗██╗  ██╗
██╔══██╗████╗ ████║██╔══██╗    ╚══██╔══╝██╔════╝██╔════╝██║  ██║
███████║██╔████╔██║██████╔╝       ██║   █████╗  ██║     ███████║
██╔══██║██║╚██╔╝██║██╔══██╗       ██║   ██╔══╝  ██║     ██╔══██║
██║  ██║██║ ╚═╝ ██║██║  ██║       ██║   ███████╗╚██████╗██║  ██║
╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝       ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝
                  PHP 8.4 · MySQL 8+ · Hostinger · 10 Agentes
BANNER
echo -e "${NC}"

hdr "DIAGNÓSTICO DEL ENTORNO"

# Verificar herramientas
for tool in opencode node npm php git composer; do
  if command -v "$tool" &>/dev/null; then
    ok "$tool: $($tool --version 2>/dev/null | head -1)"
  else
    warn "$tool: no encontrado en PATH"
  fi
done

echo ""
echo -e "  ${C}Versiones clave:${NC}"
echo "  PHP:  $(php -r 'echo PHP_VERSION;' 2>/dev/null || echo 'no instalado')"
echo "  Node: $(node --version 2>/dev/null || echo 'no instalado')"
echo "  OpenCode: $(opencode --version 2>/dev/null || echo 'no instalado')"

hdr "CONFIGURACIÓN OPENCODE"

OPENCODE_CONFIG="$HOME/.config/opencode"
AGENTS_DIR="$OPENCODE_CONFIG/agents"
FRAMEWORK_DIR="/Users/andersonmartinezrestrepo/DEV-PROJECTS/Framework"

# Verificar config
[ -f "$OPENCODE_CONFIG/opencode.json" ] && ok "opencode.json encontrado" || warn "opencode.json no encontrado"
[ -f "$FRAMEWORK_DIR/AGENTS.md" ] && ok "AGENTS.md Framework detectado" || warn "AGENTS.md no encontrado"

echo ""
echo "  Agentes disponibles:"
if [ -d "$AGENTS_DIR" ]; then
  for agent in "$AGENTS_DIR"/*.md; do
    name=$(basename "$agent" .md)
    ok "$name"
  done
else
  warn "Directorio de agentes no encontrado: $AGENTS_DIR"
fi

hdr "SISTEMA LISTO"

echo ""
echo -e "${W}  COMANDOS RÁPIDOS:${NC}"
echo ""
echo -e "  ${C}# Orquestador maestro (punto de entrada para tareas complejas)${NC}"
echo -e "  opencode --agent superorchestrator"
echo ""
echo -e "  ${C}# Arquitectura PHP 8.4${NC}"
echo -e "  opencode --agent php-architect"
echo ""
echo -e "  ${C}# Base de datos MySQL${NC}"
echo -e "  opencode --agent dba"
echo ""
echo -e "  ${C}# Frontend / Design System AMR${NC}"
echo -e "  opencode --agent uiux"
echo ""
echo -e "  ${C}# Seguridad OWASP (ejecutar antes de todo merge)${NC}"
echo -e "  opencode --agent security"
echo ""
echo -e "  ${C}# Despliegue Hostinger${NC}"
echo -e "  opencode --agent hostinger-devops"
echo ""
echo -e "  ${C}# Integraciones WhatsApp / APIs${NC}"
echo -e "  opencode --agent api-integrator"
echo ""
echo -e "  ${C}# Tests PHPUnit / Jest${NC}"
echo -e "  opencode --agent qa-tester"
echo ""
echo -e "  ${C}# Documentación automática${NC}"
echo -e "  opencode --agent documenter"
echo ""
echo -e "  ${C}# Git / Commits / PRs${NC}"
echo -e "  opencode --agent gitmaster"
echo ""
echo -e "  ${C}# Modo una línea (sin interfaz):${NC}"
echo -e "  opencode run --agent superorchestrator 'Tu tarea aquí'"
echo ""
echo -e "  ${C}# Standup diario:${NC}"
echo -e "  opencode run --agent superorchestrator 'Analiza el proyecto, dame plan de hoy'"
echo ""
echo -e "${G}  ✅ AMR Tech Multi-Agent System — ACTIVO${NC}"
echo -e "${C}  PHP 8.4 · MySQL 8+ · Hostinger · OpenCode $(opencode --version 2>/dev/null | head -1)${NC}"
echo ""
