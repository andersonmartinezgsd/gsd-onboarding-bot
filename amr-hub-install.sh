#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# AMR Hub — Instalador Portátil v2.0
# Despliega el ecosistema AMR Hub + Agentes AI en cualquier proyecto
#
# Uso:
#   ./amr-hub-install.sh                    → Instala en directorio actual
#   ./amr-hub-install.sh /ruta/al/proyecto  → Instala en proyecto específico
#   ./amr-hub-install.sh --agents-only      → Solo configura agentes OpenCode
#   ./amr-hub-install.sh --hub-only         → Solo despliega el Hub web
#
# AMR Tech © 2026
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colores ──────────────────────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ── Variables ────────────────────────────────────────
VERSION="2.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HUB_SOURCE="${SCRIPT_DIR}/hub"
AGENTS_DIR="${HOME}/.config/opencode/agents"
OPENCODE_CONFIG="${HOME}/.config/opencode/opencode.json"
INSTALL_MODE="full"
TARGET_DIR=""

# ── Funciones de UI ──────────────────────────────────
banner() {
    echo ""
    echo -e "${CYAN}${BOLD}"
    echo "  ╔═══════════════════════════════════════════════╗"
    echo "  ║        ⚡ AMR Hub — Instalador v${VERSION}        ║"
    echo "  ║     Ecosistema AI Multi-Agente + Dashboard    ║"
    echo "  ╚═══════════════════════════════════════════════╝"
    echo -e "${NC}"
}

step() { echo -e "\n${CYAN}${BOLD}▸ $1${NC}"; }
ok()   { echo -e "  ${GREEN}✔${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "  ${RED}✘${NC} $1"; }
info() { echo -e "  ${DIM}$1${NC}"; }

# ── Parsear argumentos ───────────────────────────────
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --agents-only)
                INSTALL_MODE="agents"
                shift
                ;;
            --hub-only)
                INSTALL_MODE="hub"
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                TARGET_DIR="$1"
                shift
                ;;
        esac
    done

    if [[ -z "$TARGET_DIR" ]]; then
        TARGET_DIR="$(pwd)"
    fi
}

show_help() {
    echo "AMR Hub — Instalador Portátil v${VERSION}"
    echo ""
    echo "Uso:"
    echo "  ./amr-hub-install.sh [opciones] [directorio]"
    echo ""
    echo "Opciones:"
    echo "  --agents-only    Solo instala agentes en OpenCode"
    echo "  --hub-only       Solo despliega el dashboard web"
    echo "  --help, -h       Muestra esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./amr-hub-install.sh                             # Instala en directorio actual"
    echo "  ./amr-hub-install.sh ~/GSD/td-dashboard          # Instala en td-dashboard"
    echo "  ./amr-hub-install.sh --agents-only                # Solo agentes OpenCode"
}

# ── Verificar prerequisitos ──────────────────────────
check_prerequisites() {
    step "Verificando prerequisitos..."

    # PHP 8.x
    if command -v php &>/dev/null; then
        local php_ver
        php_ver=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')
        local php_major
        php_major=$(echo "$php_ver" | cut -d. -f1)
        if [[ "$php_major" -ge 8 ]]; then
            ok "PHP ${php_ver} instalado"
        else
            fail "PHP 8.0+ requerido (encontrado: ${php_ver})"
            echo "  Instala con: brew install php (Mac) o sudo apt install php8.4 (Linux)"
            exit 1
        fi
    else
        fail "PHP no encontrado"
        echo "  Instala con: brew install php (Mac) o sudo apt install php8.4 (Linux)"
        exit 1
    fi

    # Extensiones PHP necesarias
    local required_exts=("sqlite3" "curl" "mbstring" "json")
    for ext in "${required_exts[@]}"; do
        if php -m 2>/dev/null | grep -qi "^${ext}$"; then
            ok "PHP ext-${ext} disponible"
        else
            warn "PHP ext-${ext} no detectada (puede estar built-in)"
        fi
    done

    # curl CLI
    if command -v curl &>/dev/null; then
        ok "curl disponible"
    else
        warn "curl no encontrado (necesario para Ollama)"
    fi

    # OpenCode (opcional)
    if command -v opencode &>/dev/null; then
        local oc_ver
        oc_ver=$(opencode --version 2>/dev/null || echo "desconocida")
        ok "OpenCode instalado (${oc_ver})"
    else
        warn "OpenCode no encontrado — los agentes se instalarán pero no podrás usarlos hasta instalar OpenCode"
        info "Instala con: curl -fsSL https://opencode.ai/install | bash"
    fi

    # Ollama (opcional)
    if command -v ollama &>/dev/null; then
        ok "Ollama instalado"
        # Verificar si está corriendo
        if curl -s --connect-timeout 2 http://localhost:11434/api/tags &>/dev/null; then
            local model_count
            model_count=$(curl -s http://localhost:11434/api/tags 2>/dev/null | grep -o '"name"' | wc -l | tr -d ' ')
            ok "Ollama corriendo (${model_count} modelos)"
        else
            warn "Ollama instalado pero no corriendo — inicia con: ollama serve"
        fi
    else
        warn "Ollama no encontrado — el Hub funcionará sin modelos locales"
        info "Instala con: curl -fsSL https://ollama.ai/install.sh | sh"
    fi
}

# ── Verificar que el Hub source existe ───────────────
check_hub_source() {
    if [[ ! -d "$HUB_SOURCE" ]]; then
        fail "No se encontró el directorio hub/ en ${SCRIPT_DIR}"
        echo ""
        echo "  Este instalador debe ejecutarse desde el directorio del Framework"
        echo "  o el hub/ debe estar junto al script."
        echo ""
        echo "  Estructura esperada:"
        echo "    Framework/"
        echo "    ├── amr-hub-install.sh  ← Este script"
        echo "    └── hub/               ← Código fuente del Hub"
        exit 1
    fi
    ok "Hub source encontrado: ${HUB_SOURCE}"
}

# ═══════════════════════════════════════════════════════
# FASE 1: Desplegar Hub web
# ═══════════════════════════════════════════════════════
deploy_hub() {
    step "Desplegando AMR Hub en: ${TARGET_DIR}"

    local hub_dest="${TARGET_DIR}/hub"

    # Si ya existe, preguntar
    if [[ -d "$hub_dest" ]]; then
        warn "El directorio hub/ ya existe en ${TARGET_DIR}"
        echo -n "  ¿Sobreescribir? (s/N): "
        read -r confirm
        if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
            info "Hub no modificado"
            return
        fi
    fi

    # Copiar hub completo
    mkdir -p "$hub_dest"
    rsync -a --exclude='storage/db/*.sqlite' \
             --exclude='storage/db/*.sqlite-*' \
             --exclude='storage/logs/*.log' \
             --exclude='storage/uploads/documents/*' \
             --exclude='storage/uploads/images/*' \
             --exclude='storage/uploads/videos/*' \
             --exclude='config/config.php' \
             --exclude='.DS_Store' \
             "${HUB_SOURCE}/" "${hub_dest}/"

    ok "Archivos del Hub copiados"

    # Crear directorios de storage
    mkdir -p "${hub_dest}/storage/db"
    mkdir -p "${hub_dest}/storage/logs"
    mkdir -p "${hub_dest}/storage/uploads/documents"
    mkdir -p "${hub_dest}/storage/uploads/images"
    mkdir -p "${hub_dest}/storage/uploads/videos"
    mkdir -p "${hub_dest}/storage/cache"
    ok "Directorios de storage creados"

    # Crear config.php desde example si no existe
    if [[ ! -f "${hub_dest}/config/config.php" ]]; then
        cp "${hub_dest}/config/config.example.php" "${hub_dest}/config/config.php"
        ok "config.php creado desde template"
    else
        info "config.php ya existe — no modificado"
    fi

    # Symlink de assets en public/ (relativo)
    # Primero remover symlink viejo que podría apuntar a otra ubicación
    rm -f "${hub_dest}/public/assets" 2>/dev/null || true
    cd "${hub_dest}/public" && ln -sf ../assets assets && cd - >/dev/null
    ok "Symlink de assets creado (relativo)"

    # Permisos
    chmod -R 755 "${hub_dest}/storage" 2>/dev/null || true
    chmod 644 "${hub_dest}/config/config.php" 2>/dev/null || true
    ok "Permisos configurados"
}

# ═══════════════════════════════════════════════════════
# FASE 2: Configurar OpenCode correctamente
# ═══════════════════════════════════════════════════════
setup_opencode() {
    step "Configurando OpenCode..."

    # Crear directorio de config
    mkdir -p "${HOME}/.config/opencode"
    mkdir -p "${AGENTS_DIR}"

    # Verificar y limpiar opencode.json
    if [[ -f "$OPENCODE_CONFIG" ]]; then
        # Verificar si tiene el key "agents" que causa error
        if grep -q '"agents"' "$OPENCODE_CONFIG" 2>/dev/null; then
            warn "opencode.json tiene key 'agents' inválido — corrigiendo..."

            # Crear backup
            cp "$OPENCODE_CONFIG" "${OPENCODE_CONFIG}.bak.$(date +%s)"

            # Remover el bloque "agents" usando python (más seguro que sed para JSON)
            if command -v python3 &>/dev/null; then
                python3 -c "
import json, sys
try:
    with open('${OPENCODE_CONFIG}', 'r') as f:
        config = json.load(f)
    if 'agents' in config:
        del config['agents']
    with open('${OPENCODE_CONFIG}', 'w') as f:
        json.dump(config, f, indent=2)
    print('OK')
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
" && ok "Key 'agents' removido de opencode.json" || warn "No se pudo limpiar automáticamente — hazlo manualmente"
            else
                warn "python3 no disponible — remueve manualmente el bloque 'agents' de opencode.json"
            fi
        else
            ok "opencode.json limpio (sin key 'agents' inválido)"
        fi
    else
        # Crear opencode.json básico
        cat > "$OPENCODE_CONFIG" << 'OCJSON'
{
  "provider": "ollama",
  "model": "ollama/qwen3:8b"
}
OCJSON
        ok "opencode.json creado con configuración básica"
    fi
}

# ═══════════════════════════════════════════════════════
# FASE 3: Instalar agentes como .md
# ═══════════════════════════════════════════════════════
install_agents() {
    step "Instalando agentes AI en OpenCode..."

    mkdir -p "$AGENTS_DIR"

    local count=0

    # ── Super Orquestador ────────────────────────
    cat > "${AGENTS_DIR}/superorchestrator.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
---

# Super Orquestador — AMR Tech

Eres el agente principal de orquestación de AMR Tech. Tu trabajo es planificar, delegar y supervisar tareas complejas distribuyéndolas entre los agentes especializados.

## Rol
- Analizar la solicitud del usuario y descomponerla en subtareas
- Identificar qué agente especializado es mejor para cada subtarea
- Coordinar la ejecución y validar los resultados
- Mantener la consistencia del proyecto siguiendo CLAUDE.md

## Reglas
- Siempre lee CLAUDE.md antes de planificar
- Código en inglés, UI/comentarios en español colombiano
- Aplica SOLID y PSR-12 en todo código PHP
- Usa el Design System AMR en todo frontend
- Nunca instales paquetes sin consultar
- Nunca modifiques interfaces existentes (Open/Closed)

## Agentes disponibles
- php-architect: Arquitectura PHP, SOLID, PSR-12
- dba: Bases de datos, schemas, migraciones
- uiux: Frontend, Design System, responsive
- security: Auditoría, OWASP, vulnerabilidades
- devops: Despliegues, CI/CD, configuración
- documenter: Documentación técnica
- gitmaster: Git, ramas, conventional commits
- api-integrator: APIs externas
- qa-tester: Testing, PHPUnit, Jest
AGENT_EOF
    ((count++))

    # ── PHP Architect ────────────────────────────
    cat > "${AGENTS_DIR}/php-architect.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# PHP Architect — AMR Tech

Eres el arquitecto PHP senior de AMR Tech. Diseñas la estructura de código, aplicas patrones de diseño y garantizas la calidad del código PHP.

## Reglas obligatorias
- `declare(strict_types=1)` en TODO archivo PHP
- `final class` por defecto
- `private readonly` para inyección de dependencias
- `match()` en vez de `switch()`
- PSR-12 estricto, PSR-4 autoloading
- SOLID: máximo 200 líneas por clase, interfaces pequeñas (<6 métodos)
- Repository Pattern para DB (nunca PDO directo en lógica de negocio)
- Value Objects para datos de dominio
- Nunca `define()`, usar Config object
- Nunca `global`, inyectar dependencias
- Nunca `$_GET/$_POST` directo, usar Request objects

## Estructura
```
src/
├── Contract/         ← Interfaces
├── Domain/           ← Entidades, Value Objects
├── Application/      ← Use Cases, Services
├── Infrastructure/   ← Controllers, Repos, Clients
└── Support/          ← Config, Logger, helpers
```

## Nombrado
- Clases: PascalCase
- Métodos/variables: camelCase
- Constantes: UPPER_SNAKE_CASE
- Tablas DB: snake_case plural
- Columnas: snake_case
AGENT_EOF
    ((count++))

    # ── DBA ──────────────────────────────────────
    cat > "${AGENTS_DIR}/dba.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# DBA — AMR Tech

Administrador de base de datos. Diseñas schemas, escribes migraciones, optimizas queries.

## Reglas
- Motor: InnoDB siempre
- Charset: utf8mb4 / utf8mb4_unicode_ci
- Toda tabla: id, created_at, updated_at
- Constraints nombrados: fk_tabla_columna, uq_tabla_columna
- Índices en toda columna que aparezca en WHERE o JOIN
- Prepared statements SIEMPRE (nunca concatenar SQL)
- Nunca SELECT * en producción
- Migrations en database/migrations/ con timestamps
- SQLite para dev, MySQL para producción
AGENT_EOF
    ((count++))

    # ── UI/UX Designer ───────────────────────────
    cat > "${AGENTS_DIR}/uiux.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# UI/UX Designer — AMR Tech

Diseñador de interfaces. Aplicas el Design System AMR en todo frontend.

## Design System AMR — Variables obligatorias
- Primary: #00D4FF (cyan eléctrico)
- Secondary: #7C3AED (violeta)
- Accent: #F59E0B (ámbar)
- Bg base: #0A0E1A (dark)
- Bg surface: #111827
- Fonts: Inter (body), Space Grotesk (display), JetBrains Mono (code)

## Reglas
- Vanilla JS, sin frameworks (no jQuery en proyectos nuevos)
- CSS variables del design system siempre
- Mobile-first responsive
- Clases CSS: amr-kebab-case
- Variables CSS: --amr-nombre
- Un CSS por componente, un CSS por página
- Spacing base-4: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
AGENT_EOF
    ((count++))

    # ── Security Analyst ─────────────────────────
    cat > "${AGENTS_DIR}/security.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Bash
  - Read
  - Glob
  - Grep
---

# Security Analyst — AMR Tech

Analista de seguridad. Auditas código, detectas vulnerabilidades, aplicas OWASP.

## Checklist de seguridad
1. Nunca exponer stack traces en producción
2. Validar y sanitizar todos los inputs
3. Prepared statements SIEMPRE
4. CSRF token en formularios
5. Headers de seguridad en .htaccess
6. Archivos de config fuera del webroot
7. Logs nunca en directorio público
8. .env y config.php en .gitignore
9. Secrets mínimo 32 chars alfanuméricos
10. hash_equals() para comparar tokens (timing-safe)
AGENT_EOF
    ((count++))

    # ── DevOps ───────────────────────────────────
    cat > "${AGENTS_DIR}/devops.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# DevOps Engineer — AMR Tech

Ingeniería DevOps. Despliegues, CI/CD, configuración de servidores.

## Stack
- Hosting: Hostinger Shared (sin Docker, sin root)
- PHP 8.4+ con Apache/mod_rewrite
- MySQL 8+ en producción, SQLite en dev
- Git para despliegues

## Reglas
- public/ es el ÚNICO directorio web-accesible
- .htaccess con headers de seguridad
- Config files fuera del webroot
- Logs en storage/logs/ (no público)
- Uploads en storage/uploads/ (no público)
AGENT_EOF
    ((count++))

    # ── Documenter ───────────────────────────────
    cat > "${AGENTS_DIR}/documenter.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Documenter — AMR Tech

Documentador técnico. Creas manuales, ADRs, guías de integración.

## Formato
- Documentación en español colombiano
- Código en inglés
- Markdown para toda documentación
- PHPDoc en interfaces y clases públicas
- JSDoc en funciones exportadas
AGENT_EOF
    ((count++))

    # ── Git Master ───────────────────────────────
    cat > "${AGENTS_DIR}/gitmaster.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Bash
  - Read
  - Glob
  - Grep
---

# Git Master — AMR Tech

Experto en Git. Manejo de ramas, PRs, conventional commits.

## Convenciones
- Conventional commits: feat:, fix:, refactor:, docs:, test:, chore:
- Ramas: feature/nombre, fix/nombre, release/version
- Never force push to main/master
- PRs con descripción clara y test plan
AGENT_EOF
    ((count++))

    # ── API Integrator ───────────────────────────
    cat > "${AGENTS_DIR}/api-integrator.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebFetch
---

# API Integrator — AMR Tech

Integrador de APIs. Consume y documenta servicios externos.

## Reglas
- Clientes en src/Infrastructure/Client/
- Implementar AiProviderInterface para nuevos proveedores AI
- Strategy Pattern para clientes intercambiables
- Timeout configurables
- Manejo explícito de errores HTTP
- Nunca hardcodear API keys (usar Config)
AGENT_EOF
    ((count++))

    # ── QA Tester ────────────────────────────────
    cat > "${AGENTS_DIR}/qa-tester.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# QA Tester — AMR Tech

Tester de calidad. Tests unitarios, de integración, cobertura.

## Stack de testing
- PHP: PHPUnit
- JS: Jest
- Naming: NombreClaseTest.php / nombre.test.js
- Coverage mínimo: 70% en lógica de negocio
- Test para cada Use Case y Value Object
AGENT_EOF
    ((count++))

    # ── Marketing Digital ────────────────────────
    cat > "${AGENTS_DIR}/marketing-digital.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
---

# Marketing Digital — AMR Tech

Estratega de marketing digital. Campañas, funnels, analytics, ROI.

## Capacidades
- Estrategias de marketing digital para SaaS y marketplace
- Análisis de métricas y KPIs
- Copywriting para ads, landing pages, emails
- Planificación de contenido y calendarios editoriales
- SEO técnico y de contenido
- Automatización de marketing

## Reglas
- Todo contenido en español colombiano
- Enfoque en conversión y ROI medible
- Datos antes que opiniones
AGENT_EOF
    ((count++))

    # ── Brand Analyst ────────────────────────────
    cat > "${AGENTS_DIR}/brand-analyst.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Brand Analyst — AMR Tech

Analista de marca. Identidad visual, guías de estilo, análisis competitivo.

## Design System AMR como referencia
- Primary: #00D4FF, Secondary: #7C3AED, Accent: #F59E0B
- Dark theme (#0A0E1A base)
- Fonts: Inter, Space Grotesk, JetBrains Mono
- Gradiente brand: linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%)

## Capacidades
- Crear guías de marca completas
- Analizar consistencia visual
- Generar paletas de colores
- Definir tono de voz y personalidad de marca
AGENT_EOF
    ((count++))

    # ── Automation Engineer ──────────────────────
    cat > "${AGENTS_DIR}/automation-engineer.md" << 'AGENT_EOF'
---
model: ollama/qwen3:8b
allowedTools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebFetch
---

# Automation Engineer — AMR Tech

Ingeniero de automatización. Workflows, webhooks, cron jobs, integraciones.

## Capacidades
- Diseñar workflows de automatización
- Integrar APIs y webhooks
- Crear scripts de cron y batch processing
- Automatizar despliegues y tareas repetitivas
- Integrar WhatsApp API, email, notificaciones

## Stack
- PHP para backend automation
- Node.js para event-driven workflows
- cURL/Guzzle para HTTP requests
- SQLite/MySQL para estado de workflows
AGENT_EOF
    ((count++))

    ok "${count} agentes instalados en ${AGENTS_DIR}"

    # Listar agentes instalados
    info "Agentes disponibles:"
    for agent_file in "${AGENTS_DIR}"/*.md; do
        if [[ -f "$agent_file" ]]; then
            local agent_name
            agent_name=$(basename "$agent_file" .md)
            info "  → ${agent_name}"
        fi
    done
}

# ═══════════════════════════════════════════════════════
# FASE 4: Instalar modelos Ollama recomendados
# ═══════════════════════════════════════════════════════
setup_ollama_models() {
    step "Configurando modelos Ollama..."

    if ! command -v ollama &>/dev/null; then
        warn "Ollama no instalado — saltando configuración de modelos"
        return
    fi

    if ! curl -s --connect-timeout 2 http://localhost:11434/api/tags &>/dev/null; then
        warn "Ollama no está corriendo — inicia con: ollama serve"
        return
    fi

    # Verificar si qwen3:8b ya está descargado
    if ollama list 2>/dev/null | grep -q "qwen3:8b"; then
        ok "qwen3:8b ya descargado"
    else
        echo -n "  ¿Descargar qwen3:8b (modelo principal, ~5GB)? (S/n): "
        read -r confirm
        if [[ "$confirm" != "n" && "$confirm" != "N" ]]; then
            info "Descargando qwen3:8b..."
            ollama pull qwen3:8b && ok "qwen3:8b descargado" || warn "Error descargando qwen3:8b"
        fi
    fi

    # Copiar Modelfiles si existen
    local modelfiles_dir="${SCRIPT_DIR}/ollama-models"
    if [[ -d "$modelfiles_dir" ]]; then
        for modelfile in "${modelfiles_dir}"/Modelfile.*; do
            if [[ -f "$modelfile" ]]; then
                local model_name
                model_name=$(basename "$modelfile" | sed 's/Modelfile\.//')
                if ollama list 2>/dev/null | grep -q "$model_name"; then
                    ok "Modelo custom '${model_name}' ya existe"
                else
                    info "Creando modelo custom: ${model_name}"
                    ollama create "$model_name" -f "$modelfile" 2>/dev/null && \
                        ok "Modelo '${model_name}' creado" || \
                        warn "Error creando '${model_name}' — verifica que el modelo base esté descargado"
                fi
            fi
        done
    fi
}

# ═══════════════════════════════════════════════════════
# FASE 5: Copiar CLAUDE.md al proyecto
# ═══════════════════════════════════════════════════════
setup_claude_md() {
    step "Configurando CLAUDE.md..."

    local claude_src="${SCRIPT_DIR}/CLAUDE.md"
    local claude_dest="${TARGET_DIR}/CLAUDE.md"

    if [[ -f "$claude_src" ]]; then
        if [[ -f "$claude_dest" ]]; then
            info "CLAUDE.md ya existe en el proyecto — no modificado"
        else
            cp "$claude_src" "$claude_dest"
            ok "CLAUDE.md copiado al proyecto"
        fi
    else
        warn "CLAUDE.md no encontrado en ${SCRIPT_DIR}"
    fi
}

# ═══════════════════════════════════════════════════════
# FASE 6: Crear script de inicio rápido
# ═══════════════════════════════════════════════════════
create_start_script() {
    step "Creando script de inicio..."

    local start_script="${TARGET_DIR}/amr-start.sh"

    cat > "$start_script" << 'START_EOF'
#!/usr/bin/env bash
# AMR Hub — Quick Start
# Inicia el servidor de desarrollo del Hub

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

HUB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/hub" && pwd)"
PORT="${1:-8181}"

echo -e "${CYAN}⚡ AMR Hub — Dev Server${NC}"
echo -e "  URL: ${GREEN}http://localhost:${PORT}${NC}"
echo -e "  Hub: ${HUB_DIR}/public"
echo -e "  Ctrl+C para detener"
echo ""

# Verificar symlink de assets
if [[ ! -L "${HUB_DIR}/public/assets" && ! -d "${HUB_DIR}/public/assets" ]]; then
    ln -sf ../assets "${HUB_DIR}/public/assets"
fi

php -S "localhost:${PORT}" -t "${HUB_DIR}/public"
START_EOF

    chmod +x "$start_script"
    ok "amr-start.sh creado — ejecuta ./amr-start.sh para iniciar"
}

# ═══════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════
show_summary() {
    echo ""
    echo -e "${GREEN}${BOLD}"
    echo "  ╔═══════════════════════════════════════════════╗"
    echo "  ║       ✅ AMR Hub Instalado Correctamente      ║"
    echo "  ╚═══════════════════════════════════════════════╝"
    echo -e "${NC}"

    echo -e "  ${BOLD}Proyecto:${NC}  ${TARGET_DIR}"

    if [[ "$INSTALL_MODE" != "agents" ]]; then
        echo -e "  ${BOLD}Hub:${NC}       ${TARGET_DIR}/hub/"
        echo -e "  ${BOLD}Iniciar:${NC}   cd ${TARGET_DIR} && ./amr-start.sh"
        echo -e "  ${BOLD}URL:${NC}       http://localhost:8181"
    fi

    if [[ "$INSTALL_MODE" != "hub" ]]; then
        echo -e "  ${BOLD}Agentes:${NC}   ${AGENTS_DIR}/"

        echo ""
        echo -e "  ${BOLD}Comandos de OpenCode:${NC}"
        echo -e "  ${DIM}opencode${NC}                            ${DIM}# Iniciar sin agente${NC}"
        echo -e "  ${DIM}opencode --agent superorchestrator${NC}  ${DIM}# Orquestador principal${NC}"
        echo -e "  ${DIM}opencode --agent php-architect${NC}      ${DIM}# Arquitecto PHP${NC}"
        echo -e "  ${DIM}opencode --agent uiux${NC}               ${DIM}# Diseñador UI/UX${NC}"
        echo -e "  ${DIM}opencode --agent dba${NC}                ${DIM}# Admin de base de datos${NC}"
        echo -e "  ${DIM}opencode --agent security${NC}           ${DIM}# Analista de seguridad${NC}"
        echo -e "  ${DIM}opencode --agent marketing-digital${NC}  ${DIM}# Marketing digital${NC}"
    fi

    echo ""
    echo -e "  ${BOLD}Proveedores AI configurables en el Hub:${NC}"
    echo -e "  🦙 Ollama (local, gratis) → ${DIM}http://localhost:11434${NC}"
    echo -e "  🤖 OpenAI (GPT-4o, etc.) → ${DIM}Configura API key en Settings${NC}"
    echo -e "  🧠 Anthropic (Claude)    → ${DIM}Configura API key en Settings${NC}"

    echo ""
    echo -e "  ${CYAN}AMR Tech © 2026${NC}"
    echo ""
}

# ═══════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════
main() {
    parse_args "$@"
    banner

    echo -e "  ${BOLD}Modo:${NC}     ${INSTALL_MODE}"
    echo -e "  ${BOLD}Destino:${NC}  ${TARGET_DIR}"

    check_prerequisites

    case "$INSTALL_MODE" in
        full)
            check_hub_source
            deploy_hub
            setup_opencode
            install_agents
            setup_ollama_models
            setup_claude_md
            create_start_script
            ;;
        hub)
            check_hub_source
            deploy_hub
            create_start_script
            ;;
        agents)
            setup_opencode
            install_agents
            ;;
    esac

    show_summary
}

main "$@"
