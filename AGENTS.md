# AGENTS.md — AMR Tech · Sistema Multi-Agente OpenCode

> Este archivo es leído automáticamente por OpenCode como instrucciones globales.
> También aplica para Cursor, GitHub Copilot, ChatGPT, Gemini y cualquier otro agente de IA.
> Colocar en la raíz de CADA proyecto AMR Tech.

---

## Empresa y stack

**AMR Tech** — automatización de ventas WhatsApp + marketplace tecnológico.
**Stack principal:** PHP 8.4+ · MySQL 8+ · Node.js 20+ · Hostinger Shared Hosting

| Capa | Tecnología |
|---|---|
| Backend | PHP 8.4+ · PSR-12 · SOLID estricto |
| Base de datos | MySQL 8+ · InnoDB · utf8mb4 |
| Runtime JS | Node.js 20+ |
| Frontend | Vanilla JS · CSS3 · HTML5 (sin React/Vue) |
| Hosting | Hostinger Shared Hosting (sin Docker, sin root) |
| Dominios | andersonmares.xyz · webtechnology.com.co |
| Idioma código | inglés |
| Idioma UI/comentarios | español colombiano |

---

## 10 Agentes especializados OpenCode

Invocar con: `opencode --agent nombre-agente`

| Agente | Cuándo activarlo |
|---|---|
| `superorchestrator` | Tarea compleja que involucra 2+ agentes o requiere plan |
| `php-architect` | Crear/modificar clases PHP, interfaces, use cases, repositories |
| `dba` | Queries MySQL, migraciones, optimización, schema |
| `uiux` | Componentes frontend, design system AMR, CSS, HTML, JS |
| `security` | Revisión antes de merge, auditoría OWASP, secrets |
| `hostinger-devops` | .htaccess, despliegue Hostinger, GitHub Actions |
| `documenter` | Documentar features, bugs, decisiones de arquitectura |
| `gitmaster` | Crear branches, commits, PRs |
| `api-integrator` | WhatsApp (Whatauto/Evolution/wpp-web.js), webhooks, APIs externas |
| `qa-tester` | PHPUnit, Jest, cobertura, casos edge |

---

## Flujo obligatorio de toda tarea IA

```
1. superorchestrator recibe → analiza → plan DAG
2. Agente(s) especialista(s) ejecutan
3. security valida en paralelo
4. documenter registra en .amr/docs/
5. gitmaster: branch feature/IA-* + commit
6. superorchestrator reporta a Anderson
7. Anderson aprueba merge — NUNCA los agentes
```

---

## Arquitectura obligatoria PHP (no cambiar)

```
proyecto/
├── public/                ← ÚNICO directorio web-accesible
│   ├── index.php          ← bootstrap, sin lógica de negocio
│   ├── webhook.php        ← si aplica
│   └── .htaccess
├── src/
│   ├── Contract/          ← Interfaces (sufijo Interface)
│   ├── Domain/            ← Entidades, Value Objects, Events
│   ├── Application/       ← Use Cases, Services
│   ├── Infrastructure/    ← Persistence/, Http/, Client/
│   └── Support/           ← Config, Logger, Database
├── config/                ← retorna arrays PHP (nunca define())
├── database/migrations/   ← V{timestamp}_{descripcion}.sql
├── storage/logs/          ← fuera del webroot
├── tests/Unit/
├── tests/Integration/
├── .amr/docs/             ← documentación de agentes IA
└── vendor/
```

---

## Reglas absolutas PHP

```php
declare(strict_types=1);          // primera línea SIEMPRE
final class NombreClase {}        // final por defecto
private readonly Type $prop;      // readonly para DI
match() en vez de switch()
$obj?->method()                   // null-safe operator
```

NUNCA:
- `define()` → usar Config object
- `global $variable` → inyectar dependencias
- `$_GET/$_POST` directo en lógica → usar Request objects
- `echo` en clases → separar presentación
- `SELECT *` en producción
- PDO directo en lógica → usar Repository pattern
- Clases > 200 líneas → dividir

---

## Reglas absolutas JavaScript / Node.js

```javascript
'use strict';
const en vez de var/let cuando sea posible
async/await en vez de callbacks
=== siempre (nunca ==)
try/catch en TODA llamada async
```

NUNCA: `var`, `==`, `console.log` en producción, credenciales hardcodeadas.

---

## Design System AMR (frontend)

```css
--amr-primary: #00D4FF      /* cyan eléctrico */
--amr-secondary: #7C3AED    /* violeta */
--amr-bg-base: #0A0E1A      /* fondo principal */
--amr-bg-surface: #111827   /* cards */
--amr-text-primary: #F9FAFB
```

Fuentes: Inter · Space Grotesk · JetBrains Mono (Google Fonts)
Prefijo clases CSS: `amr-`
Prefijo variables CSS: `--amr-`
Sin jQuery en proyectos nuevos.

---

## DB — convenciones

- Motor: InnoDB siempre
- Charset: utf8mb4 / utf8mb4_unicode_ci
- Columnas mínimas: `id`, `created_at`, `updated_at`
- FK nombradas: `fk_tabla_columna`
- Índices en toda columna con WHERE, JOIN, ORDER BY

---

## Seguridad — no negociable

1. Prepared statements SIEMPRE (nunca concatenar SQL)
2. CSRF token en formularios
3. Headers de seguridad en .htaccess
4. .env y config.php en .gitignore
5. hash_equals() para comparar tokens
6. No stack traces en producción
7. Archivos sensibles fuera del webroot

---

## Git — Conventional Commits

```
feat(scope): descripción en inglés
fix(scope): descripción en inglés
refactor / docs / test / chore / style / hotfix

feat(bot): add evolution-api whatsapp client
fix(flow): correct getFirstStep fetch chain
```

Ramas: `main` (prod) · `develop` · `feature/*` · `fix/*` · `hotfix/*`
Merge solo via PR aprobado por Anderson.
