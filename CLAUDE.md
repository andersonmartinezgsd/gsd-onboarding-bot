# CLAUDE.md — AMR Tech · Contexto maestro para Claude

> Este archivo se coloca en la raíz de CADA proyecto.
> Claude lo lee automáticamente al inicio de cada conversación.
> Otros agentes (Cursor, Copilot, GPT) deben leerlo también como primer mensaje.

---

## 👤 Sobre el equipo

- **Empresa:** AMR Tech — automatización de ventas y marketplace tecnológico
- **Stack principal:** PHP 8.4+ / Node.js 20+ / MySQL 8+ / Vanilla JS (jQuery solo en legacy)
- **Hosting:** Hostinger Shared Hosting (sin Docker, sin root)
- **Dominio principal:** `andersonmares.xyz` / `webtechnology.com.co`
- **Idioma de código:** inglés (variables, funciones, clases)
- **Idioma de comentarios y UI:** español colombiano

---

## 🏗 Arquitectura obligatoria

### PHP — PSR-12 + SOLID estricto

```
proyecto/
├── public/          ← ÚNICO directorio web-accesible
│   └── index.php    ← Bootstrap, sin lógica de negocio
├── src/
│   ├── Contract/    ← Interfaces (sufijo Interface o Contract)
│   ├── Domain/      ← Entidades, Value Objects, Domain Events
│   ├── Application/ ← Use Cases / Services
│   ├── Infrastructure/
│   │   ├── Persistence/   ← Repositorios, DB adapters
│   │   ├── Http/          ← Controllers, Middleware
│   │   └── Client/        ← Clientes de APIs externas
│   └── Support/     ← Config, Logger, helpers transversales
├── config/          ← Retorna arrays PHP, nunca define()
├── database/        ← schema.sql, migrations/
├── storage/
│   ├── logs/
│   └── uploads/
├── vendor/          ← autoload.php (Composer o manual PSR-4)
├── tests/           ← PHPUnit
└── CLAUDE.md        ← Este archivo
```

### Node.js — CommonJS o ESM consistente por proyecto

```
proyecto/
├── src/
│   ├── config/      ← Configuración centralizada
│   ├── services/    ← Lógica de negocio
│   ├── handlers/    ← Event handlers, message handlers
│   ├── clients/     ← Clientes externos (WhatsApp, APIs)
│   └── utils/       ← Helpers puros sin side effects
├── tests/
├── .env.example     ← Template del .env (NUNCA el .env real)
├── bot.js / app.js  ← Entry point
└── CLAUDE.md
```

### Frontend / Dashboard

```
proyecto/
├── assets/
│   ├── css/
│   │   ├── design-system.css   ← Variables globales del design system
│   │   ├── components/         ← Un CSS por componente
│   │   └── pages/              ← Un CSS por página
│   ├── js/
│   │   ├── core/               ← Helpers, API client, state
│   │   ├── components/         ← Componentes reutilizables
│   │   └── pages/              ← Un JS por vista
│   └── fonts/
├── views/           ← Partials/templates PHP o HTML
└── public/
```

---

## 🎨 Design System AMR (obligatorio en TODO frontend)

### Paleta de colores

```css
/* COPIAR EXACTAMENTE en design-system.css */
:root {
  /* ── Brand ─────────────────────────────── */
  --amr-primary:        #00D4FF;   /* cyan eléctrico */
  --amr-primary-dark:   #0099BB;
  --amr-primary-light:  #66E8FF;
  --amr-secondary:      #7C3AED;   /* violeta */
  --amr-accent:         #F59E0B;   /* ámbar */

  /* ── Neutrales (dark-first) ────────────── */
  --amr-bg-base:        #0A0E1A;   /* fondo principal */
  --amr-bg-surface:     #111827;   /* cards, panels */
  --amr-bg-elevated:    #1F2937;   /* hover, inputs */
  --amr-bg-overlay:     #374151;   /* dropdowns, tooltips */

  /* ── Texto ──────────────────────────────── */
  --amr-text-primary:   #F9FAFB;
  --amr-text-secondary: #9CA3AF;
  --amr-text-muted:     #6B7280;
  --amr-text-disabled:  #374151;

  /* ── Bordes ─────────────────────────────── */
  --amr-border:         #1F2937;
  --amr-border-focus:   #00D4FF;
  --amr-border-error:   #EF4444;

  /* ── Semánticos ─────────────────────────── */
  --amr-success:        #10B981;
  --amr-warning:        #F59E0B;
  --amr-error:          #EF4444;
  --amr-info:           #3B82F6;

  /* ── Gradientes ─────────────────────────── */
  --amr-gradient-brand: linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%);
  --amr-gradient-dark:  linear-gradient(180deg, #111827 0%, #0A0E1A 100%);

  /* ── Espaciado (base-4) ─────────────────── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* ── Border radius ──────────────────────── */
  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  16px;
  --radius-xl:  24px;
  --radius-full: 9999px;

  /* ── Sombras ────────────────────────────── */
  --shadow-sm:  0 1px 3px rgba(0,0,0,.4);
  --shadow-md:  0 4px 16px rgba(0,212,255,.08);
  --shadow-lg:  0 8px 32px rgba(0,212,255,.12);
  --shadow-glow: 0 0 24px rgba(0,212,255,.25);

  /* ── Tipografía ─────────────────────────── */
  --font-sans:  'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', 'Fira Code', monospace;
  --font-display: 'Space Grotesk', 'Inter', sans-serif;

  --text-xs:   11px;
  --text-sm:   13px;
  --text-base: 15px;
  --text-lg:   17px;
  --text-xl:   20px;
  --text-2xl:  24px;
  --text-3xl:  30px;
  --text-4xl:  36px;

  /* ── Transiciones ───────────────────────── */
  --transition-fast:   150ms ease;
  --transition-base:   250ms ease;
  --transition-slow:   400ms ease;

  /* ── Z-index ────────────────────────────── */
  --z-base:    1;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-modal:    300;
  --z-toast:    400;
  --z-tooltip:  500;
}
```

### Tipografía — Google Fonts (cargar siempre)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Layout de dashboard — estructura HTML base

```html
<div class="amr-layout">
  <aside class="amr-sidebar">
    <div class="sidebar-brand"><!-- Logo --></div>
    <nav class="sidebar-nav"><!-- Links --></nav>
    <div class="sidebar-footer"><!-- User info --></div>
  </aside>
  <main class="amr-main">
    <header class="amr-topbar"><!-- Breadcrumb + actions --></header>
    <div class="amr-content">
      <!-- PAGE CONTENT -->
    </div>
  </main>
</div>
```

---

## 📐 Reglas de código — OBLIGATORIAS

### SOLID (PHP y JS/TS)

| Principio | Regla en este proyecto |
|---|---|
| **S** — Single Responsibility | Una clase = un motivo para cambiar. Max 200 líneas por clase |
| **O** — Open/Closed | Extender via interfaces, no modificar clases existentes |
| **L** — Liskov | Subclases/implementaciones no rompen el contrato de la interfaz |
| **I** — Interface Segregation | Interfaces pequeñas. Nunca una interfaz con >6 métodos |
| **D** — Dependency Inversion | Depender de abstracciones (interfaces), no de implementaciones |

### Patrones de diseño usados en este proyecto

| Patrón | Dónde |
|---|---|
| **Repository** | Acceso a DB — nunca PDO directo en lógica de negocio |
| **Value Object** | Mensajes entrantes, configuración, entidades de dominio |
| **Strategy** | Clientes de mensajería intercambiables (Whatauto/wpp-web.js) |
| **Factory** | Construcción de objetos complejos |
| **Observer** | Eventos de dominio |
| **Singleton** | Solo para conexión DB por request |

### Reglas PHP

```php
// ✅ SIEMPRE
declare(strict_types=1);                    // primera línea
final class NombreClase { }                 // final por defecto
private readonly Type $prop;               // readonly para DI
match() en vez de switch()                 // PHP 8+
$nullable?->method()                       // null-safe operator

// ❌ NUNCA
define('CONSTANTE', 'valor');              // usar Config object
global $variable;                          // inyectar dependencias
$_GET/$_POST directo en lógica             // usar Request objects
echo en clases                             // separar presentación
@unlink (silenciar errores)               // manejar explícitamente
```

### Reglas JavaScript / Node.js

```javascript
// ✅ SIEMPRE
'use strict';                              // en CommonJS
const en vez de var/let cuando sea posible
async/await en vez de callbacks
?.  y  ??  para null-safety
Desestructuración para extraer propiedades
try/catch en TODA llamada async

// ❌ NUNCA
var (nunca)
== (usar ===)
Callbacks anidados (callback hell)
console.log en producción (usar Logger)
Credenciales hardcodeadas (usar .env)
```

### Nombrado — convenciones estrictas

| Tipo | PHP | JS/TS |
|---|---|---|
| Clase | `PascalCase` | `PascalCase` |
| Interface | `NombreInterface` | `INombre` o `NombreInterface` |
| Método/Función | `camelCase` | `camelCase` |
| Variable | `camelCase` | `camelCase` |
| Constante | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` |
| Archivo PHP clase | `NombreClase.php` | — |
| Archivo JS módulo | — | `camelCase.js` |
| Tabla DB | `snake_case` plural | — |
| Columna DB | `snake_case` | — |
| CSS clase | `amr-kebab-case` | — |
| CSS variable | `--amr-nombre` | — |

---

## 🗄 Convenciones de base de datos

```sql
-- Toda tabla tiene estas columnas mínimas:
id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

-- Constraints: siempre nombrados
CONSTRAINT fk_tabla_columna FOREIGN KEY ...
CONSTRAINT uq_tabla_columna UNIQUE KEY ...

-- Índices en toda columna que aparezca en WHERE o JOIN
-- Motor: InnoDB siempre
-- Charset: utf8mb4 / utf8mb4_unicode_ci siempre
```

---

## 🔒 Seguridad — no negociable

```
1. Nunca exponer stack traces en producción
2. Siempre validar y sanitizar inputs
3. Prepared statements SIEMPRE (nunca concatenar SQL)
4. CSRF token en formularios
5. Headers de seguridad en .htaccess
6. Archivos de config fuera del webroot
7. Logs NUNCA en directorio público
8. .env y config.php en .gitignore
9. Secrets mínimo 32 chars alfanuméricos
10. hash_equals() para comparar tokens (timing-safe)
```

---

## 🧪 Testing

- PHP: PHPUnit — mínimo tests para Use Cases y Value Objects
- JS: Jest — mínimo tests para servicios y handlers
- Naming: `NombreClaseTest.php` / `nombre.test.js`
- Coverage mínimo esperado: 70% en lógica de negocio

---

## 📋 Comportamiento esperado de la IA

Cuando trabajes en este proyecto:

1. **Antes de escribir código**, identifica qué capa del proyecto afecta
2. **Propón la interfaz primero** si vas a crear un servicio nuevo
3. **Nunca uses `define()`** — usa el objeto `Config`
4. **Nunca uses funciones globales** — inyecta dependencias
5. **Siempre `declare(strict_types=1)`** en PHP
6. **Siempre `'use strict'`** en JS (CommonJS)
7. Si un archivo supera 200 líneas, **propón dividirlo**
8. Usa los **colores y variables del design system** en todo frontend
9. Los **mensajes de usuario van en español**, el código en inglés
10. Aplica **PSR-12** sin excepciones en PHP

---

## 🚫 Cosas que NUNCA hacer en este proyecto

```
❌ Instalar paquetes npm/composer sin consultarlo primero
❌ Cambiar el schema de DB sin migration
❌ Romper interfaces existentes (Open/Closed)
❌ Mezclar lógica de negocio con presentación
❌ Hardcodear URLs, IPs o credenciales
❌ Usar SELECT * en consultas de producción
❌ Ignorar excepciones con catch vacío
❌ Crear archivos PHP en /public/ (solo webhook/index)
❌ Modificar vendor/ manualmente
❌ Usar jQuery para proyectos nuevos (solo legacy)
```
