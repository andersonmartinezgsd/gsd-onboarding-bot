#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════╗
# ║          AMR Tech — INSTALADOR DE NUEVO PROYECTO v2.0           ║
# ║          OpenCode · 10 Agentes IA · Wizard Interactivo          ║
# ║          Plataforma: macOS + Cursor                             ║
# ╚══════════════════════════════════════════════════════════════════╝
#
# USO:
#   bash amr_new_project.sh [nombre-del-proyecto]
#
# El wizard pregunta qué stack, lenguaje e infraestructura usar.
# Genera la estructura, agentes y configuración adecuados.

set -euo pipefail

FRAMEWORK_DIR="/Users/andersonmartinezrestrepo/DEV-PROJECTS/Framework"

# ── Colores ──
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'
B='\033[0;34m'; P='\033[0;35m'; C='\033[0;36m'
W='\033[1;37m'; NC='\033[0m'

ok()   { echo -e "${G}  ✅ $1${NC}"; }
warn() { echo -e "${Y}  ⚠️  $1${NC}"; }
err()  { echo -e "${R}  ❌ $1${NC}"; exit 1; }
hdr()  { echo -e "\n${P}══════════════════════════════════════${NC}"; echo -e "${W}  $1${NC}"; echo -e "${P}══════════════════════════════════════${NC}"; }
ask()  { echo -e "  ${C}$1${NC}"; }
inp()  { read -r -p "    → " "$1"; }

clear
echo -e "${P}"
cat << 'BANNER'
 █████╗ ███╗   ███╗██████╗     ████████╗███████╗ ██████╗██╗  ██╗
██╔══██╗████╗ ████║██╔══██╗    ╚══██╔══╝██╔════╝██╔════╝██║  ██║
███████║██╔████╔██║██████╔╝       ██║   █████╗  ██║     ███████║
██╔══██║██║╚██╔╝██║██╔══██╗       ██║   ██╔══╝  ██║     ██╔══██║
██║  ██║██║ ╚═╝ ██║██║  ██║       ██║   ███████╗╚██████╗██║  ██║
╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝       ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝
                  Nuevo Proyecto — Wizard Interactivo
BANNER
echo -e "${NC}"

# ╔══════════════════════════════════════════════════════╗
# ║  WIZARD — Preguntas de configuración del proyecto    ║
# ╚══════════════════════════════════════════════════════╝

hdr "WIZARD — CONFIGURACIÓN DEL PROYECTO"

# ── 1. Nombre del proyecto ──
if [ -n "${1:-}" ]; then
  PROJECT_NAME="$1"
else
  ask "1. ¿Nombre del proyecto? (snake_case recomendado)"
  inp PROJECT_NAME
  PROJECT_NAME="${PROJECT_NAME:-mi-proyecto-amr}"
fi

PROJECT_DIR="$(pwd)/$PROJECT_NAME"
[ -d "$PROJECT_DIR" ] && err "El directorio $PROJECT_DIR ya existe"

# ── 2. Lenguaje / Stack backend ──
echo ""
ask "2. ¿Cuál es el lenguaje/stack backend principal?"
echo "     1) PHP 8.4+ — PSR-12, SOLID, Hostinger (stack principal AMR)"
echo "     2) Node.js 20+ — Express/Fastify, bots, webhooks en tiempo real"
echo "     3) PHP 8.4 + Node.js — backend PHP con bot Node.js paralelo"
echo "     4) Solo Frontend — HTML/CSS/Vanilla JS (sin backend propio)"
echo "     5) Otro (especificar)"
inp STACK_CHOICE

case "${STACK_CHOICE:-1}" in
  1) STACK="php";       STACK_LABEL="PHP 8.4 (PSR-12 + SOLID)";;
  2) STACK="node";      STACK_LABEL="Node.js 20+ (Express/Fastify)";;
  3) STACK="php+node";  STACK_LABEL="PHP 8.4 + Node.js 20+";;
  4) STACK="frontend";  STACK_LABEL="Frontend (HTML/CSS/Vanilla JS)";;
  5) ask "  Especifica el stack:"; inp STACK_LABEL; STACK="custom";;
  *) STACK="php";       STACK_LABEL="PHP 8.4 (PSR-12 + SOLID)";;
esac

# ── 3. Base de datos ──
echo ""
ask "3. ¿Base de datos?"
echo "     1) MySQL 8+ — InnoDB, utf8mb4 (recomendado AMR)"
echo "     2) SQLite — desarrollo local, sin servidor"
echo "     3) MongoDB — documentos JSON"
echo "     4) Ninguna (solo APIs externas)"
inp DB_CHOICE

case "${DB_CHOICE:-1}" in
  1) DB="mysql";   DB_LABEL="MySQL 8+ (InnoDB)";;
  2) DB="sqlite";  DB_LABEL="SQLite";;
  3) DB="mongo";   DB_LABEL="MongoDB";;
  4) DB="none";    DB_LABEL="Sin DB propia";;
  *) DB="mysql";   DB_LABEL="MySQL 8+ (InnoDB)";;
esac

# ── 4. Infraestructura / Hosting ──
echo ""
ask "4. ¿Dónde se va a desplegar?"
echo "     1) Hostinger Shared Hosting — sin Docker, sin root (default AMR)"
echo "     2) VPS/Cloud con Docker — Digital Ocean, AWS EC2, etc."
echo "     3) VPS sin Docker — servidor propio con SSH"
echo "     4) Solo local — desarrollo en Mac, sin despliegue aún"
echo "     5) Serverless / Vercel / Netlify"
inp INFRA_CHOICE

case "${INFRA_CHOICE:-1}" in
  1) INFRA="hostinger";   INFRA_LABEL="Hostinger Shared Hosting";;
  2) INFRA="docker";      INFRA_LABEL="VPS con Docker";;
  3) INFRA="vps";         INFRA_LABEL="VPS sin Docker (SSH)";;
  4) INFRA="local";       INFRA_LABEL="Solo desarrollo local";;
  5) INFRA="serverless";  INFRA_LABEL="Serverless / Vercel / Netlify";;
  *) INFRA="hostinger";   INFRA_LABEL="Hostinger Shared Hosting";;
esac

# ── 5. Integración WhatsApp ──
echo ""
ask "5. ¿Integración WhatsApp?"
echo "     1) Whatauto — HTTP REST, envíos masivos"
echo "     2) Evolution API — multi-device, más robusto"
echo "     3) wpp-web.js / whatsapp-web.js — Node.js WebSocket"
echo "     4) Múltiple (Strategy pattern con interfaz)"
echo "     5) Ninguna"
inp WA_CHOICE

case "${WA_CHOICE:-5}" in
  1) WA="whatauto";    WA_LABEL="Whatauto (HTTP REST)";;
  2) WA="evolution";   WA_LABEL="Evolution API";;
  3) WA="wppwebjs";    WA_LABEL="wpp-web.js (Node.js)";;
  4) WA="multi";       WA_LABEL="Multi-proveedor (Strategy Pattern)";;
  5) WA="none";        WA_LABEL="Sin integración WhatsApp";;
  *) WA="none";        WA_LABEL="Sin integración WhatsApp";;
esac

# ── 6. Tipo de proyecto ──
echo ""
ask "6. ¿Tipo de proyecto?"
echo "     1) Bot WhatsApp + Dashboard admin"
echo "     2) API REST / Webhook handler"
echo "     3) Marketplace / E-commerce"
echo "     4) Dashboard / Panel de gestión"
echo "     5) Microservicio / Integrador de APIs"
echo "     6) Otro"
inp TYPE_CHOICE

case "${TYPE_CHOICE:-1}" in
  1) PROJ_TYPE="whatsapp-bot";  TYPE_LABEL="Bot WhatsApp + Dashboard";;
  2) PROJ_TYPE="api";           TYPE_LABEL="API REST / Webhook";;
  3) PROJ_TYPE="marketplace";   TYPE_LABEL="Marketplace / E-commerce";;
  4) PROJ_TYPE="dashboard";     TYPE_LABEL="Dashboard / Panel de gestión";;
  5) PROJ_TYPE="microservice";  TYPE_LABEL="Microservicio / Integrador";;
  6) ask "  Describe el tipo:"; inp TYPE_LABEL; PROJ_TYPE="custom";;
  *) PROJ_TYPE="api";           TYPE_LABEL="API REST / Webhook";;
esac

# ── Confirmar ──
echo ""
echo -e "${P}══════════════════════════════════════════${NC}"
echo -e "${W}  RESUMEN DEL PROYECTO${NC}"
echo -e "${P}══════════════════════════════════════════${NC}"
echo -e "  ${C}Nombre:${NC}       $PROJECT_NAME"
echo -e "  ${C}Tipo:${NC}         $TYPE_LABEL"
echo -e "  ${C}Stack:${NC}        $STACK_LABEL"
echo -e "  ${C}Base de datos:${NC} $DB_LABEL"
echo -e "  ${C}Hosting:${NC}      $INFRA_LABEL"
echo -e "  ${C}WhatsApp:${NC}     $WA_LABEL"
echo -e "  ${C}Directorio:${NC}   $PROJECT_DIR"
echo ""
ask "¿Confirmas la creación? (Enter = sí / n = cancelar)"
read -r CONFIRM
[ "${CONFIRM:-}" = "n" ] && echo "  Cancelado." && exit 0

# ╔══════════════════════════════════════╗
# ║  FASE 1 — ESTRUCTURA DE DIRECTORIOS ║
# ╚══════════════════════════════════════╝
hdr "FASE 1 — ESTRUCTURA DE CARPETAS"

# Directorios base siempre presentes
mkdir -p "$PROJECT_DIR"/{config,storage/{logs,uploads},tests/{Unit,Integration},.amr/docs/{features,bugs,decisions,runbooks}}

# Según stack
if [[ "$STACK" == "php" || "$STACK" == "php+node" ]]; then
  mkdir -p "$PROJECT_DIR"/{public,database/migrations}
  mkdir -p "$PROJECT_DIR"/src/{Contract,Domain/{Entity,ValueObject,Event},Application/{UseCase,Service},Infrastructure/{Persistence,Http,Client},Support}
fi

if [[ "$STACK" == "node" || "$STACK" == "php+node" ]]; then
  mkdir -p "$PROJECT_DIR"/bot/{src/{config,services,handlers,clients,utils},tests}
fi

if [[ "$STACK" == "frontend" ]]; then
  mkdir -p "$PROJECT_DIR"/{public,views}
fi

# Frontend assets (siempre si hay UI)
if [[ "$STACK" != "node" ]]; then
  mkdir -p "$PROJECT_DIR"/assets/{css/{components,pages},js/{core,components,pages},fonts}
fi

ok "Estructura de directorios creada para stack: $STACK_LABEL"

# ╔══════════════════════════════════════╗
# ║  FASE 2 — ARCHIVOS DEL FRAMEWORK    ║
# ╚══════════════════════════════════════╝
hdr "FASE 2 — ARCHIVOS BASE (Framework AMR)"

cp "$FRAMEWORK_DIR/CLAUDE.md"    "$PROJECT_DIR/"
cp "$FRAMEWORK_DIR/AGENTS.md"    "$PROJECT_DIR/"
cp "$FRAMEWORK_DIR/STANDARDS.md" "$PROJECT_DIR/"
ok "CLAUDE.md, AGENTS.md, STANDARDS.md copiados"

# ╔══════════════════════════════════════╗
# ║  FASE 3 — OPENCODE CONFIG LOCAL     ║
# ╚══════════════════════════════════════╝
hdr "FASE 3 — OPENCODE CONFIG LOCAL"

# Determinar agentes activos según stack
ACTIVE_AGENTS='"superorchestrator", "security", "documenter", "gitmaster"'

[[ "$STACK" == "php" || "$STACK" == "php+node" ]] && ACTIVE_AGENTS+=', "php-architect", "qa-tester"'
[[ "$STACK" == "node" || "$STACK" == "php+node" ]] && ACTIVE_AGENTS+=', "api-integrator"'
[[ "$DB" != "none" ]] && ACTIVE_AGENTS+=', "dba"'
[[ "$STACK" != "node" ]] && ACTIVE_AGENTS+=', "uiux"'
[[ "$INFRA" != "local" ]] && ACTIVE_AGENTS+=', "hostinger-devops"'
[[ "$WA" != "none" ]] && ACTIVE_AGENTS+=', "api-integrator"'

cat > "$PROJECT_DIR/opencode.json" << OCEOF
{
  "\$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-opus-4-6",
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "$PROJECT_DIR"],
      "enabled": true
    }
  },
  "instructions": ["./AGENTS.md"],
  "permission": {
    "bash": "allow",
    "edit": "allow",
    "write": "allow",
    "read": "allow",
    "webfetch": "allow"
  }
}
OCEOF
ok "opencode.json creado (detectado automáticamente por OpenCode)"

# ╔══════════════════════════════════════╗
# ║  FASE 4 — ARCHIVOS SEGÚN STACK      ║
# ╚══════════════════════════════════════╝
hdr "FASE 4 — ARCHIVOS DE CÓDIGO BASE"

# ── PHP ──
if [[ "$STACK" == "php" || "$STACK" == "php+node" ]]; then

  # public/index.php
  cat > "$PROJECT_DIR/public/index.php" << 'EOF'
<?php
declare(strict_types=1);

define('BASE_PATH', dirname(__DIR__));
define('APP_START', microtime(true));

require_once BASE_PATH . '/vendor/autoload.php';

$config = require BASE_PATH . '/config/config.php';
EOF
  ok "public/index.php creado"

  # public/.htaccess
  cat > "$PROJECT_DIR/public/.htaccess" << 'EOF'
Options -Indexes
ServerSignature Off

<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

<FilesMatch "\.(env|log|sql|md|json|lock|sh|key|pem)$">
    Order allow,deny
    Deny from all
</FilesMatch>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
EOF
  ok "public/.htaccess con headers de seguridad creado"

  # composer.json
  cat > "$PROJECT_DIR/composer.json" << CEOF
{
    "name": "amr-tech/$PROJECT_NAME",
    "description": "$TYPE_LABEL — AMR Tech",
    "type": "project",
    "require": {
        "php": "^8.4"
    },
    "require-dev": {
        "phpunit/phpunit": "^11"
    },
    "autoload": {
        "psr-4": { "Amr\\": "src/" }
    },
    "autoload-dev": {
        "psr-4": { "Amr\\Tests\\": "tests/" }
    },
    "config": {
        "sort-packages": true,
        "platform": { "php": "8.4" }
    }
}
CEOF
  ok "composer.json creado (PHP 8.4)"

  # phpunit.xml
  cat > "$PROJECT_DIR/phpunit.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="vendor/autoload.php" colors="true">
    <testsuites>
        <testsuite name="Unit"><directory>tests/Unit</directory></testsuite>
        <testsuite name="Integration"><directory>tests/Integration</directory></testsuite>
    </testsuites>
    <source><include><directory>src</directory></include></source>
</phpunit>
EOF
  ok "phpunit.xml creado"

fi

# ── config/config.example.php ──
if [[ "$STACK" != "frontend" ]]; then
  cat > "$PROJECT_DIR/config/config.example.php" << CONFEOF
<?php
declare(strict_types=1);
// Copiar como config.php y completar con valores reales
return [
    'app' => [
        'name'    => '$PROJECT_NAME',
        'env'     => 'development',
        'debug'   => true,
        'secret'  => 'cambiar-por-32-chars-alfanumericos',
    ],
$(if [[ "$DB" == "mysql" ]]; then
cat << 'DBEOF'
    'database' => [
        'host'      => 'localhost',
        'port'      => 3306,
        'name'      => 'nombre_db',
        'user'      => 'usuario_db',
        'password'  => 'contraseña_db',
        'charset'   => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
    ],
DBEOF
fi)
$(if [[ "$WA" != "none" ]]; then
cat << 'WAEOF'
    'whatsapp' => [
        'provider' => 'whatauto', // whatauto | evolution | wppconnect
        'api_url'  => '',
        'token'    => '',
    ],
WAEOF
fi)
];
CONFEOF
  ok "config/config.example.php creado"
fi

# ── Node.js ──
if [[ "$STACK" == "node" || "$STACK" == "php+node" ]]; then
  BOT_DIR="$PROJECT_DIR$( [[ "$STACK" == "php+node" ]] && echo "/bot" || echo "" )"

  cat > "$BOT_DIR/package.json" << PKGEOF
{
  "name": "$PROJECT_NAME-bot",
  "version": "1.0.0",
  "description": "$TYPE_LABEL - Bot AMR Tech",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "node --watch src/app.js",
    "test": "jest"
  },
  "engines": { "node": ">=20.0.0" }
}
PKGEOF

  cat > "$BOT_DIR/src/app.js" << 'EOF'
'use strict';

const config = require('./config');
// Entry point — sin lógica de negocio aquí
EOF
  ok "Node.js estructura creada"

  cat > "$BOT_DIR/.env.example" << 'EOF'
# Copiar como .env y completar
NODE_ENV=development
PORT=3000
ANTHROPIC_API_KEY=sk-ant-
WHATSAPP_API_URL=
WHATSAPP_TOKEN=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=
DB_USER=
DB_PASSWORD=
EOF
  ok ".env.example creado para Node.js"
fi

# ── DB Schema ──
if [[ "$DB" == "mysql" ]]; then
  cat > "$PROJECT_DIR/database/schema.sql" << SQLEOF
-- AMR Tech · Schema · $PROJECT_NAME
-- $(date '+%Y-%m-%d') · MySQL 8+ · InnoDB · utf8mb4_unicode_ci

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS contacts (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    phone      VARCHAR(20)  NOT NULL,
    name       VARCHAR(100)     NULL,
    status     ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
    metadata   JSON             NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_contacts_phone UNIQUE KEY (phone),
    KEY idx_contacts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
SQLEOF
  ok "database/schema.sql creado"
fi

# ── Frontend assets ──
if [[ "$STACK" != "node" ]]; then
  cp "$FRAMEWORK_DIR/assets/css/design-system.css" "$PROJECT_DIR/assets/css/design-system.css" 2>/dev/null || \
  cat > "$PROJECT_DIR/assets/css/design-system.css" << 'EOF'
/* AMR Tech Design System — ver assets/css/design-system.css del Framework */
:root {
  --amr-primary: #00D4FF; --amr-secondary: #7C3AED;
  --amr-bg-base: #0A0E1A; --amr-bg-surface: #111827;
  --amr-text-primary: #F9FAFB; --amr-text-secondary: #9CA3AF;
  --amr-success: #10B981; --amr-error: #EF4444;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Space Grotesk', 'Inter', sans-serif;
}
EOF
  ok "assets/css/design-system.css creado"
fi

# ╔══════════════════════════════════════╗
# ║  FASE 5 — .GITIGNORE               ║
# ╚══════════════════════════════════════╝
hdr "FASE 5 — .GITIGNORE"

cat > "$PROJECT_DIR/.gitignore" << 'EOF'
# Dependencias
/vendor/
/node_modules/
/bot/node_modules/

# Configuración sensible
/config/config.php
/.env
/bot/.env
/.env.local
/.env.*.local

# Storage
/storage/logs/*.log
/storage/uploads/

# IDE
.DS_Store
.idea/
*.swp

# Caché
/.amr/logs/
/cache/
EOF
ok ".gitignore creado"

# ╔══════════════════════════════════════╗
# ║  FASE 6 — CURSOR / VSCODE CONFIG   ║
# ╚══════════════════════════════════════╝
hdr "FASE 6 — CURSOR / VSCODE"

mkdir -p "$PROJECT_DIR/.vscode"

cat > "$PROJECT_DIR/.cursorrules" << CREOF
# AMR Tech — $PROJECT_NAME
# Stack: $STACK_LABEL | DB: $DB_LABEL | Hosting: $INFRA_LABEL | WhatsApp: $WA_LABEL

## Agentes OpenCode (en terminal de Cursor)
opencode --agent superorchestrator    # punto de entrada para tareas complejas
opencode --agent php-architect        # clases PHP 8.4, interfaces, use cases
opencode --agent dba                  # queries MySQL, migraciones
opencode --agent uiux                 # Design System AMR, CSS, HTML
opencode --agent security             # auditoría OWASP (antes de CUALQUIER merge)
opencode --agent hostinger-devops     # .htaccess, deploy Hostinger
opencode --agent api-integrator       # WhatsApp ($WA_LABEL), webhooks
opencode --agent qa-tester            # PHPUnit 11, Jest, cobertura 70%+
opencode --agent documenter           # docs en .amr/docs/
opencode --agent gitmaster            # commits, branches, PRs

## Reglas absolutas
- PHP: declare(strict_types=1) · final class · readonly · prepared statements SIEMPRE
- JS: 'use strict' · const · async/await · === · try/catch
- CSS: variables --amr-* · clases amr-kebab-case · mobile-first · dark-mode
- DB: InnoDB · utf8mb4 · prepared statements · índices en WHERE/JOIN
- Sin SELECT * · Sin define() · Sin global · Sin jQuery (proyectos nuevos)

## Infra: $INFRA_LABEL
CREOF
ok ".cursorrules creado"

cat > "$PROJECT_DIR/.vscode/extensions.json" << 'EOF'
{
  "recommendations": [
    "bmewburn.vscode-intelephense-client",
    "eamodio.gitlens",
    "esbenp.prettier-vscode",
    "editorconfig.editorconfig",
    "rangav.vscode-thunder-client"
  ]
}
EOF
ok ".vscode/extensions.json creado"

# ╔══════════════════════════════════════╗
# ║  FASE 7 — SCRIPT DE INICIO          ║
# ╚══════════════════════════════════════╝
hdr "FASE 7 — SCRIPT DE INICIO"

cat > "$PROJECT_DIR/amr-start.sh" << STARTEOF
#!/usr/bin/env bash
# AMR Tech · $PROJECT_NAME · Sistema de Agentes
# Stack: $STACK_LABEL | $INFRA_LABEL | $WA_LABEL

G='\033[0;32m'; C='\033[0;36m'; W='\033[1;37m'; P='\033[0;35m'; Y='\033[1;33m'; NC='\033[0m'

echo -e "\${P}════════════════════════════════════════════════\${NC}"
echo -e "\${W}  AMR Tech · $PROJECT_NAME\${NC}"
echo -e "\${C}  $STACK_LABEL · $DB_LABEL · $INFRA_LABEL\${NC}"
echo -e "\${C}  WhatsApp: $WA_LABEL\${NC}"
echo -e "\${P}════════════════════════════════════════════════\${NC}"
echo ""

command -v opencode &>/dev/null && echo -e "\${G}  ✅ OpenCode \$(opencode --version 2>/dev/null | head -1)\${NC}" || echo -e "\${Y}  ⚠️  OpenCode no encontrado (npm install -g opencode-ai@latest)\${NC}"

echo ""
echo -e "\${W}  AGENTES PARA ESTE PROYECTO:\${NC}"
echo -e "  \${C}opencode --agent superorchestrator\${NC}   ← SIEMPRE empezar aquí"
$(if [[ "$STACK" == "php" || "$STACK" == "php+node" ]]; then echo 'echo -e "  ${C}opencode --agent php-architect${NC}       ← PHP 8.4, SOLID, PSR-12"'; fi)
$(if [[ "$DB" != "none" ]]; then echo 'echo -e "  ${C}opencode --agent dba${NC}                 ← '$DB_LABEL'"'; fi)
$(if [[ "$STACK" != "node" ]]; then echo 'echo -e "  ${C}opencode --agent uiux${NC}                ← Design System AMR"'; fi)
echo -e "  \${C}opencode --agent security\${NC}            ← OWASP (antes de merge)"
$(if [[ "$INFRA" != "local" ]]; then echo 'echo -e "  ${C}opencode --agent hostinger-devops${NC}    ← '$INFRA_LABEL'"'; fi)
$(if [[ "$WA" != "none" ]]; then echo 'echo -e "  ${C}opencode --agent api-integrator${NC}      ← WhatsApp: '$WA_LABEL'"'; fi)
echo -e "  \${C}opencode --agent qa-tester\${NC}           ← PHPUnit 11 / Jest"
echo -e "  \${C}opencode --agent documenter\${NC}          ← Docs en .amr/docs/"
echo -e "  \${C}opencode --agent gitmaster\${NC}           ← Commits, PRs"
echo ""
echo -e "\${W}  MODO UNA LÍNEA:\${NC}"
echo -e "  opencode run --agent superorchestrator 'Analiza el proyecto y dame el plan'"
echo ""
STARTEOF
chmod +x "$PROJECT_DIR/amr-start.sh"
ok "amr-start.sh creado"

# ╔══════════════════════════════════════╗
# ║  VERIFICACIÓN FINAL                  ║
# ╚══════════════════════════════════════╝
hdr "VERIFICACIÓN FINAL"

PASS=0; FAIL=0
chk() { if eval "$2" > /dev/null 2>&1; then ok "$1"; ((PASS++)); else warn "FALTA: $1"; ((FAIL++)); fi }

chk "CLAUDE.md"           "[ -f $PROJECT_DIR/CLAUDE.md ]"
chk "AGENTS.md"           "[ -f $PROJECT_DIR/AGENTS.md ]"
chk "opencode.json local" "[ -f $PROJECT_DIR/opencode.json ]"
chk ".gitignore"          "[ -f $PROJECT_DIR/.gitignore ]"
chk ".cursorrules"        "[ -f $PROJECT_DIR/.cursorrules ]"
chk ".amr/docs/"          "[ -d $PROJECT_DIR/.amr/docs ]"
chk "amr-start.sh"        "[ -x $PROJECT_DIR/amr-start.sh ]"

if [[ "$STACK" == "php" || "$STACK" == "php+node" ]]; then
  chk "src/Contract/"     "[ -d $PROJECT_DIR/src/Contract ]"
  chk "src/Domain/"       "[ -d $PROJECT_DIR/src/Domain ]"
  chk "public/index.php"  "[ -f $PROJECT_DIR/public/index.php ]"
  chk "composer.json"     "[ -f $PROJECT_DIR/composer.json ]"
fi

if [[ "$DB" == "mysql" ]]; then
  chk "database/schema.sql" "[ -f $PROJECT_DIR/database/schema.sql ]"
fi

echo ""
echo -e "${P}╔══════════════════════════════════════════════╗${NC}"
printf  "${P}║${NC}  ${W}RESULTADO:${NC}  ${G}%2d ✅ PASS${NC}  |  ${R}%2d ❌ FAIL${NC}       ${P}║${NC}\n" $PASS $FAIL
echo -e "${P}╚══════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${P}════════════════════════════════════════════════${NC}"
echo -e "${W}  PROYECTO CREADO: $PROJECT_NAME${NC}"
echo -e "${C}  Stack:   $STACK_LABEL${NC}"
echo -e "${C}  DB:      $DB_LABEL${NC}"
echo -e "${C}  Hosting: $INFRA_LABEL${NC}"
echo -e "${C}  WA:      $WA_LABEL${NC}"
echo -e "${P}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${Y}  PRÓXIMOS PASOS:${NC}"
echo ""
if [[ "$STACK" == "php" || "$STACK" == "php+node" ]]; then
  echo -e "  ${C}# 1. Configurar credenciales${NC}"
  echo -e "  cp $PROJECT_DIR/config/config.example.php $PROJECT_DIR/config/config.php"
  echo -e "  # Editar con datos reales"
  echo ""
  echo -e "  ${C}# 2. Instalar dependencias PHP${NC}"
  echo -e "  cd $PROJECT_DIR && composer install"
  echo ""
fi
echo -e "  ${C}# Abrir en Cursor${NC}"
echo -e "  cursor $PROJECT_DIR"
echo ""
echo -e "  ${C}# Activar agentes${NC}"
echo -e "  cd $PROJECT_DIR && ./amr-start.sh"
echo -e "  opencode --agent superorchestrator"
echo ""
echo -e "${G}  ✅ AMR Tech — $PROJECT_NAME listo para desarrollar${NC}"
echo ""
