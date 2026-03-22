# Manual OpenCode + AMR Tech
## Sistema Multi-Agente para Desarrollo Acelerado

> **Versión:** 1.0 | **Fecha:** Marzo 2026
> **Motor:** OpenCode CLI v1.2.27+
> **Plataforma:** macOS + Cursor

---

## ¿Qué es este sistema?

OpenCode es un CLI que permite invocar modelos de IA (Claude Opus/Sonnet) directamente desde la terminal, con acceso a los archivos del proyecto via MCP (Model Context Protocol). Combinado con agentes especializados, se convierte en un equipo de desarrollo virtual que sigue las reglas AMR Tech al pie de la letra.

El sistema tiene **10 agentes especializados** que conocen el stack AMR Tech (PHP 8.1+, MySQL, Hostinger, Design System AMR) y sus reglas de arquitectura (SOLID, PSR-12, Repository pattern, etc.).

---

## Estado actual del sistema

```
OpenCode CLI:        v1.2.27 ✅ instalado
Config global:       ~/.config/opencode/opencode.json ✅
Agentes:             ~/.config/opencode/agents/ (10 agentes) ✅
Instrucciones:       DEV-PROJECTS/Framework/AGENTS.md ✅
MCP Filesystem:      apunta a DEV-PROJECTS/ ✅
```

---

## Los 10 agentes AMR Tech

| # | Agente | Modelo | Especialidad |
|---|---|---|---|
| 1 | `superorchestrator` | Opus | Coordinador maestro, crea planes DAG |
| 2 | `php-architect` | Opus | PHP 8.1+, SOLID, PSR-12, DDD |
| 3 | `dba` | Sonnet | MySQL 8+, migraciones, optimización |
| 4 | `uiux` | Sonnet | Design System AMR, CSS, HTML, vanilla JS |
| 5 | `security` | Opus | OWASP Top 10, PHP security, CSRF, XSS |
| 6 | `hostinger-devops` | Opus | .htaccess, despliegue Hostinger, CI/CD |
| 7 | `documenter` | Sonnet | Docs en .amr/docs/, ADRs, runbooks |
| 8 | `gitmaster` | Sonnet | Branches, Conventional Commits, PRs |
| 9 | `api-integrator` | Opus | WhatsApp, webhooks, APIs externas |
| 10 | `qa-tester` | Sonnet | PHPUnit, Jest, cobertura mínima 70% |

---

## Comandos esenciales

### Modo interactivo (sesión de chat con el agente)
```bash
opencode --agent superorchestrator
opencode --agent php-architect
opencode --agent security
```

### Modo una línea (sin interfaz, ideal para tareas concretas)
```bash
opencode run --agent superorchestrator "Revisa el proyecto y dame el plan de trabajo"
opencode run --agent php-architect "Crea el use case ProcessIncomingMessage siguiendo DDD"
opencode run --agent security "Audita todos los archivos PHP del proyecto"
opencode run --agent dba "Crea la migración para la tabla whatsapp_sessions"
```

### Ver agentes disponibles
```bash
ls ~/.config/opencode/agents/
```

### Ver configuración actual
```bash
cat ~/.config/opencode/opencode.json
```

---

## Flujo de trabajo recomendado

### Para una nueva feature

```bash
# 1. Abrir el proyecto en Cursor
cursor /ruta/al/proyecto

# 2. En la terminal de Cursor, activar el orquestador
opencode --agent superorchestrator

# 3. Describir la tarea
> "Necesito implementar el módulo de gestión de contactos WhatsApp.
>  Debe guardar número, nombre, estado de conversación en MySQL.
>  Seguir SOLID y el patrón Repository. Tests PHPUnit incluidos."

# El superorchestrator crea el plan y coordina los agentes automáticamente
```

### Para trabajo específico sin orquestador

```bash
# Solo backend PHP
opencode --agent php-architect
> "Crea la entidad Contact con sus value objects Phone y ContactName"

# Solo DB
opencode --agent dba
> "Crea la migración V20260317_create_contacts_table.sql"

# Solo frontend
opencode --agent uiux
> "Crea el componente amr-card para mostrar info de contacto"

# Solo tests
opencode --agent qa-tester
> "Escribe PHPUnit tests para ContactRepository cubriendo CRUD"
```

### Para despliegue en Hostinger

```bash
opencode --agent hostinger-devops
> "Prepara el .htaccess y el script de despliegue para el proyecto"
```

### Para auditoría de seguridad antes de merge

```bash
opencode --agent security
> "Audita todos los cambios en src/ y public/ antes del merge a main"
```

---

## Configurar un nuevo proyecto AMR Tech

### Paso 1 — Copiar los archivos del Framework al nuevo proyecto

```bash
# Desde el directorio del nuevo proyecto
cp /Users/andersonmartinezrestrepo/DEV-PROJECTS/Framework/CLAUDE.md .
cp /Users/andersonmartinezrestrepo/DEV-PROJECTS/Framework/AGENTS.md .
cp /Users/andersonmartinezrestrepo/DEV-PROJECTS/Framework/STANDARDS.md .
```

### Paso 2 — Crear estructura de directorios

```bash
mkdir -p public src/{Contract,Domain/{Entity,ValueObject,Event},Application/{UseCase,Service},Infrastructure/{Persistence,Http,Client},Support} config database/migrations storage/{logs,uploads} tests/{Unit,Integration} .amr/docs/{features,bugs,decisions,runbooks}
```

### Paso 3 — Actualizar opencode.json para el nuevo proyecto

Editar `~/.config/opencode/opencode.json` y agregar la ruta del nuevo proyecto al MCP filesystem:

```json
"filesystem-amr": {
  "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem",
              "/Users/andersonmartinezrestrepo/DEV-PROJECTS",
              "/ruta/al/nuevo/proyecto"]
}
```

O mejor: **crear un `opencode.json` local en la raíz del proyecto** (OpenCode lo detecta automáticamente):

```json
{
  "model": "anthropic/claude-opus-4-6",
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "."],
      "enabled": true
    }
  },
  "instructions": ["./AGENTS.md"],
  "permission": {
    "bash": "allow",
    "edit": "allow",
    "write": "allow",
    "read": "allow"
  }
}
```

### Paso 4 — Crear .env del proyecto

```bash
cp config/config.example.php config/config.php
# Editar con credenciales reales
# Verificar que config.php está en .gitignore
```

### Paso 5 — Activar el sistema

```bash
# Desde la raíz del nuevo proyecto
opencode --agent superorchestrator
> "Lee el AGENTS.md y CLAUDE.md de este proyecto. Dame un diagnóstico inicial y el primer paso a implementar."
```

---

## Usar opencode.json por proyecto (recomendado)

Cada proyecto puede tener su propio `opencode.json` en la raíz. OpenCode lo detecta automáticamente. Esto permite:
- Apuntar el MCP filesystem solo al proyecto actual
- Tener instrucciones específicas del proyecto
- Diferentes modelos por proyecto si es necesario

**Plantilla `opencode.json` para proyecto AMR Tech:**

```json
{
  "model": "anthropic/claude-opus-4-6",
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "."],
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
```

---

## Standup diario con IA

```bash
opencode run --agent superorchestrator \
  "Analiza el estado actual del proyecto en $(pwd).
   Dame en bullets: qué está hecho, qué falta, bloqueadores y qué agente activar primero hoy."
```

---

## Auditoría de seguridad rápida

```bash
opencode run --agent security \
  "Audita el proyecto completo. Checklist OWASP Top 10 PHP.
   Reporta CRÍTICO/ALTO/MEDIO/BAJO con archivo, línea y fix."
```

---

## Crear documentación automática

```bash
opencode run --agent documenter \
  "Documenta los cambios de hoy en .amr/docs/features/FEA-$(date +%Y%m%d)-nombre.md"
```

---

## Troubleshooting

### "opencode: command not found"
```bash
npm install -g opencode-ai@latest
# O verificar PATH:
echo $PATH | grep -o 'npm-global\|.npm'
```

### El agente no conoce el proyecto
- Verificar que el MCP filesystem apunta al directorio correcto
- Verificar que AGENTS.md existe en la raíz del proyecto
- Verificar `opencode.json` con `cat ~/.config/opencode/opencode.json`

### Error de API key
```bash
# Verificar que ANTHROPIC_API_KEY está en el entorno
echo $ANTHROPIC_API_KEY
# Si no: agregar al .zshrc
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
source ~/.zshrc
```

### El agente ignora las reglas PHP
- El AGENTS.md debe estar en la raíz del proyecto
- Verificar que `"instructions": ["./AGENTS.md"]` está en opencode.json

---

## Referencia rápida de agentes

```
BACKEND PHP:
  opencode --agent php-architect    → clases, interfaces, use cases

BASE DE DATOS:
  opencode --agent dba              → queries, migraciones MySQL

FRONTEND:
  opencode --agent uiux             → componentes, design system AMR

SEGURIDAD:
  opencode --agent security         → auditoría OWASP, pre-merge

DESPLIEGUE:
  opencode --agent hostinger-devops → .htaccess, Hostinger, CI/CD

INTEGRACIONES:
  opencode --agent api-integrator   → WhatsApp, webhooks, APIs

TESTS:
  opencode --agent qa-tester        → PHPUnit, Jest, coverage

DOCUMENTACIÓN:
  opencode --agent documenter       → .amr/docs/, ADRs

GIT:
  opencode --agent gitmaster        → branches, commits, PRs

TODO:
  opencode --agent superorchestrator → plan + coordinación
```

---

## Buenas prácticas

1. **Siempre describir el contexto completo** al activar un agente: qué proyecto, qué capa, qué ya existe
2. **El superorchestrator primero** para tareas de más de 2 horas de trabajo
3. **Security siempre** antes de hacer commit a main/develop
4. **Un agente a la vez** salvo que el superorchestrator coordine paralelos
5. **Verificar el output** — los agentes pueden cometer errores, revisar antes de aceptar
6. **Mantener AGENTS.md actualizado** en cada proyecto con cambios de arquitectura
7. **Gitmaster al final** — no hacer commits manuales cuando el sistema está activo

---

*AMR Tech · OpenCode v1.2.27 · 10 Agentes · PHP 8.1+ · MySQL 8+ · Hostinger*
