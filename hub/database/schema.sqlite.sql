-- ═══════════════════════════════════════════════════
-- AMR Hub · Schema SQLite · v1.0
-- ═══════════════════════════════════════════════════

-- Usuarios del sistema
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    email           TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL,
    role            TEXT    NOT NULL DEFAULT 'admin' CHECK(role IN ('admin','editor','viewer')),
    avatar          TEXT    NULL,
    is_active       INTEGER NOT NULL DEFAULT 1,
    last_login_at   TEXT    NULL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Proveedores AI configurados
CREATE TABLE IF NOT EXISTS ai_providers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    label       TEXT    NOT NULL,
    base_url    TEXT    NOT NULL,
    api_key     TEXT    NULL,
    is_active   INTEGER NOT NULL DEFAULT 1,
    config_json TEXT    NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Conversaciones con AI
CREATE TABLE IF NOT EXISTS conversations (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT    NULL,
    provider      TEXT    NOT NULL DEFAULT 'ollama',
    model         TEXT    NOT NULL DEFAULT 'qwen3:8b',
    context_type  TEXT    NOT NULL DEFAULT 'general',
    context_id    INTEGER NULL,
    message_count INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Mensajes individuales
CREATE TABLE IF NOT EXISTS messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role            TEXT    NOT NULL,
    content         TEXT    NOT NULL,
    model_used      TEXT    NULL,
    tokens_in       INTEGER NULL DEFAULT 0,
    tokens_out      INTEGER NULL DEFAULT 0,
    latency_ms      INTEGER NULL DEFAULT 0,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Proyectos escaneados
CREATE TABLE IF NOT EXISTS projects (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    path          TEXT    NOT NULL,
    total_files   INTEGER NOT NULL DEFAULT 0,
    total_lines   INTEGER NOT NULL DEFAULT 0,
    languages_json TEXT   NULL,
    issues_count  INTEGER NOT NULL DEFAULT 0,
    scan_status   TEXT    NOT NULL DEFAULT 'pending',
    report_json   TEXT    NULL,
    refactor_plan TEXT    NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Archivos de proyecto (detalle del escaneo)
CREATE TABLE IF NOT EXISTS project_files (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER NOT NULL,
    file_path   TEXT    NOT NULL,
    language    TEXT    NULL,
    line_count  INTEGER NOT NULL DEFAULT 0,
    size_bytes  INTEGER NOT NULL DEFAULT 0,
    functions_json TEXT NULL,
    issues_json TEXT    NULL,
    category    TEXT    NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    CONSTRAINT fk_project_files_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);

-- Marcas (Brand Manager)
CREATE TABLE IF NOT EXISTS brands (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    description     TEXT    NULL,
    primary_color   TEXT    NULL,
    secondary_color TEXT    NULL,
    accent_color    TEXT    NULL,
    palette_json    TEXT    NULL,
    fonts_json      TEXT    NULL,
    guidelines_md   TEXT    NULL,
    logo_path       TEXT    NULL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Assets de marca
CREATE TABLE IF NOT EXISTS brand_assets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    brand_id    INTEGER NOT NULL,
    file_name   TEXT    NOT NULL,
    file_path   TEXT    NOT NULL,
    file_type   TEXT    NOT NULL,
    mime_type   TEXT    NOT NULL,
    size_bytes  INTEGER NOT NULL DEFAULT 0,
    metadata_json TEXT  NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    CONSTRAINT fk_brand_assets_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_brand_assets_brand ON brand_assets(brand_id);

-- Agentes AI
CREATE TABLE IF NOT EXISTS agents (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id        TEXT    NOT NULL UNIQUE,
    name            TEXT    NOT NULL,
    category        TEXT    NOT NULL DEFAULT 'framework',
    description     TEXT    NULL,
    system_prompt   TEXT    NULL,
    preferred_model TEXT    NULL,
    status          TEXT    NOT NULL DEFAULT 'active',
    capabilities_json TEXT  NULL,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    xp              INTEGER NOT NULL DEFAULT 0,
    level           TEXT    NOT NULL DEFAULT 'junior',
    icon            TEXT    NULL DEFAULT '🤖',
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Tareas de agentes
CREATE TABLE IF NOT EXISTS agent_tasks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id     INTEGER NOT NULL,
    title        TEXT    NOT NULL,
    description  TEXT    NOT NULL,
    priority     TEXT    NOT NULL DEFAULT 'medium',
    status       TEXT    NOT NULL DEFAULT 'pending',
    result       TEXT    NULL,
    started_at   TEXT    NULL,
    completed_at TEXT    NULL,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    CONSTRAINT fk_agent_tasks_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);

-- Documentos subidos (Document Intelligence)
CREATE TABLE IF NOT EXISTS documents (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name      TEXT    NOT NULL,
    file_path      TEXT    NOT NULL,
    file_type      TEXT    NOT NULL,
    mime_type      TEXT    NOT NULL,
    size_bytes     INTEGER NOT NULL DEFAULT 0,
    status         TEXT    NOT NULL DEFAULT 'pending',
    extracted_text TEXT    NULL,
    analysis_json  TEXT    NULL,
    summary        TEXT    NULL,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Configuraciones (key-value)
CREATE TABLE IF NOT EXISTS settings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    key_name   TEXT NOT NULL UNIQUE,
    value_text TEXT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════
-- SEED DATA — Proveedores y Agentes iniciales
-- ═══════════════════════════════════════════════════

-- Usuario administrador por defecto
-- Contraseña: Admin2025! — hash real generado por Auth::install() en el primer arranque
-- Este registro se omite si ya existe (OR IGNORE), por lo tanto es idempotente
INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES
('Administrador', 'admin@amrtech.co', '__PLACEHOLDER__', 'admin');

-- Proveedores AI
INSERT OR IGNORE INTO ai_providers (name, label, base_url, is_active) VALUES
('ollama', 'Ollama Local', 'http://localhost:11434', 1),
('openai', 'OpenAI', 'https://api.openai.com/v1', 0),
('anthropic', 'Anthropic', 'https://api.anthropic.com/v1', 0);

-- Agentes del Framework (existentes)
INSERT OR IGNORE INTO agents (agent_id, name, category, description, icon, status) VALUES
('superorchestrator', 'Super Orquestador', 'framework', 'Orquesta y delega tareas entre todos los agentes. Planifica y supervisa el trabajo.', '🧠', 'active'),
('php-architect', 'PHP Architect', 'framework', 'Arquitecto PHP — diseña la estructura, aplica SOLID, PSR-12, crea interfaces y clases.', '🏗️', 'active'),
('dba', 'DBA', 'framework', 'Administrador de base de datos — esquemas, migraciones, queries optimizados.', '🗄️', 'active'),
('uiux', 'UI/UX Designer', 'framework', 'Diseñador de interfaces — aplica el Design System AMR, crea vistas responsivas.', '🎨', 'active'),
('security', 'Security Analyst', 'framework', 'Analista de seguridad — audita código, detecta vulnerabilidades, aplica OWASP.', '🔒', 'active'),
('devops', 'DevOps Engineer', 'framework', 'Ingeniería DevOps — despliegues, CI/CD, configuración de servidores.', '⚙️', 'active'),
('documenter', 'Documenter', 'framework', 'Documentador técnico — crea manuales, ADRs, guías de integración.', '📝', 'active'),
('gitmaster', 'Git Master', 'framework', 'Experto en Git — manejo de ramas, PRs, conventional commits.', '🌿', 'active'),
('api-integrator', 'API Integrator', 'framework', 'Integrador de APIs — consume y documenta servicios externos.', '🔌', 'active'),
('qa-tester', 'QA Tester', 'framework', 'Tester de calidad — escribe tests unitarios, de integración, valida cobertura.', '🧪', 'active');

-- Agentes nuevos de Marketing y Automatización
INSERT OR IGNORE INTO agents (agent_id, name, category, description, icon, status) VALUES
('marketing-digital', 'Marketing Digital', 'marketing', 'Estratega de marketing digital — campañas, funnels, analytics, ROI.', '📈', 'active'),
('social-media', 'Social Media Manager', 'marketing', 'Gestor de redes sociales — contenido, calendarios, engagement, trending.', '📱', 'active'),
('seo-specialist', 'SEO Specialist', 'marketing', 'Especialista SEO — keywords, meta tags, schema markup, link building.', '🔍', 'active'),
('content-creator', 'Content Creator', 'marketing', 'Creador de contenido — copywriting, blogs, newsletters, scripts de video.', '✍️', 'active'),
('brand-analyst', 'Brand Analyst', 'marketing', 'Analista de marca — identidad visual, guías de estilo, análisis competitivo.', '🎯', 'active'),
('automation-engineer', 'Automation Engineer', 'automation', 'Ingeniero de automatización — workflows, n8n, webhooks, cron jobs, integración.', '🤖', 'active'),
('data-analyst', 'Data Analyst', 'analytics', 'Analista de datos — métricas, dashboards, reportes, visualización de datos.', '📊', 'active'),
('email-marketing', 'Email Marketing', 'marketing', 'Especialista en email — plantillas, secuencias, A/B testing, deliverability.', '📧', 'active'),
('video-producer', 'Video Producer', 'marketing', 'Productor de video — guiones, storyboards, edición, thumbnails, shorts.', '🎬', 'active'),
('sales-strategist', 'Sales Strategist', 'sales', 'Estratega de ventas — pipelines, CRM, scripts de venta, follow-up automation.', '💼', 'active');
