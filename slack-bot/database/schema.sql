-- =============================================================================
-- Onboarding / Offboarding SQLite Schema
-- All DDL uses IF NOT EXISTS for idempotent migrations
-- =============================================================================

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- =============================================================================
-- Lookup tables (dynamic lists editable from the bot)
-- =============================================================================

CREATE TABLE IF NOT EXISTS clients (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    source      TEXT    NOT NULL DEFAULT 'local',  -- 'local' | 'hubspot' | 'api'
    external_id TEXT    NULL,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
-- Seed default GSD client
INSERT OR IGNORE INTO clients (name, source) VALUES ('GSD', 'local');

CREATE TABLE IF NOT EXISTS departments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL UNIQUE,
    is_active  INTEGER NOT NULL DEFAULT 1,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO departments (name) VALUES
    ('Engineering'),
    ('Design'),
    ('Marketing'),
    ('Sales'),
    ('HR'),
    ('Finance'),
    ('Operations'),
    ('Support'),
    ('Management');

CREATE TABLE IF NOT EXISTS role_titles (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL UNIQUE,
    is_active  INTEGER NOT NULL DEFAULT 1,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO role_titles (name) VALUES
    ('Software Engineer'),
    ('Senior Software Engineer'),
    ('Frontend Developer'),
    ('Backend Developer'),
    ('DevOps Engineer'),
    ('QA Engineer'),
    ('Product Manager'),
    ('Project Manager'),
    ('UX Designer'),
    ('Graphic Designer'),
    ('Sales Representative'),
    ('Account Executive'),
    ('Account Manager'),
    ('Customer Success Manager'),
    ('Marketing Specialist'),
    ('Content Writer'),
    ('HR Specialist'),
    ('HR Manager'),
    ('Finance Analyst'),
    ('Operations Coordinator'),
    ('CEO'),
    ('CTO'),
    ('COO'),
    ('Director'),
    ('Manager'),
    ('Coordinator'),
    ('Analyst');

-- =============================================================================
-- Main processes table: one row per onboarding or offboarding event
-- =============================================================================

CREATE TABLE IF NOT EXISTS processes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    process_type      TEXT    NOT NULL CHECK(process_type IN ('onboarding','offboarding')),
    status            TEXT    NOT NULL DEFAULT 'pending'
                      CHECK(status IN ('pending','in_progress','completed','cancelled','failed')),

    -- Client this employee belongs to (defaults to 'GSD')
    client_name       TEXT    NOT NULL DEFAULT 'GSD',

    -- Employee details collected from the Slack modal
    first_name        TEXT    NULL,
    last_name         TEXT    NULL,
    employee_name     TEXT    NOT NULL,  -- kept for backwards compat: first_name + last_name
    employee_email    TEXT    NOT NULL,  -- auto-generated: first_name.first_last_name@gsdoutsources.com
    employee_slack    TEXT    NULL,      -- Slack user ID once the account exists
    department        TEXT    NULL,
    role_title        TEXT    NULL,
    start_date        TEXT    NULL,      -- ISO date (YYYY-MM-DD)
    last_day          TEXT    NULL,      -- ISO date, offboarding only

    -- Flags
    google_voice_required INTEGER NOT NULL DEFAULT 0,

    -- People
    manager_slack     TEXT    NULL,      -- Slack user ID of the direct manager
    file_transfer_to  TEXT    NULL,      -- Slack user ID for Drive file transfer (offboarding)

    -- External system identifiers
    github_username   TEXT    NULL,
    google_email      TEXT    NULL,

    -- Tools provisioned for this employee (role-based)
    tools_json        TEXT    NULL DEFAULT '["google_workspace"]',

    -- JSON arrays for multi-value fields
    repos_json        TEXT    NULL DEFAULT '[]',
    channels_json     TEXT    NULL DEFAULT '[]',

    -- Offboarding context
    offboard_reason   TEXT    NULL,

    -- Equipment / device tracking
    equipment_status  TEXT    NULL DEFAULT 'pending',
                      -- 'pending' | 'available' | 'vendor_requested' | 'shipped' | 'received' | 'not_required'
    equipment_shipped_at  TEXT NULL,
    equipment_received_at TEXT NULL,
    equipment_notes   TEXT    NULL,  -- shipping guide, tracking number, etc.
    vendor_quote_url  TEXT    NULL,

    -- Slack message references (used for in-place updates via chat.update)
    slack_channel     TEXT    NULL,
    slack_ts          TEXT    NULL,

    -- Audit
    initiated_by      TEXT    NULL,
    meta_json         TEXT    NULL DEFAULT '{}',
    created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_processes_type   ON processes(process_type);
CREATE INDEX IF NOT EXISTS idx_processes_status ON processes(status);
CREATE INDEX IF NOT EXISTS idx_processes_email  ON processes(employee_email);

CREATE TRIGGER IF NOT EXISTS processes_updated_at
AFTER UPDATE ON processes
FOR EACH ROW
BEGIN
    UPDATE processes SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- Individual checklist steps within a process
-- =============================================================================

CREATE TABLE IF NOT EXISTS steps (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    process_id    INTEGER NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    step_key      TEXT    NOT NULL,
    step_label    TEXT    NOT NULL,
    status        TEXT    NOT NULL DEFAULT 'pending'
                  CHECK(status IN ('pending','in_progress','completed','failed','skipped')),
    assigned_to   TEXT    NULL,
    result_json   TEXT    NULL,
    error_message TEXT    NULL,
    started_at    TEXT    NULL,
    completed_at  TEXT    NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_steps_process ON steps(process_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_steps_process_key ON steps(process_id, step_key);

-- =============================================================================
-- Migrations for existing databases (guarded by the migration runner's try/catch)
-- =============================================================================
ALTER TABLE processes ADD COLUMN tools_json TEXT NOT NULL DEFAULT '["google_workspace"]';
ALTER TABLE processes ADD COLUMN client_name TEXT NOT NULL DEFAULT 'GSD';
ALTER TABLE processes ADD COLUMN first_name TEXT NULL;
ALTER TABLE processes ADD COLUMN last_name TEXT NULL;
ALTER TABLE processes ADD COLUMN google_voice_required INTEGER NOT NULL DEFAULT 0;
ALTER TABLE processes ADD COLUMN equipment_status TEXT NULL DEFAULT 'pending';
ALTER TABLE processes ADD COLUMN equipment_shipped_at TEXT NULL;
ALTER TABLE processes ADD COLUMN equipment_received_at TEXT NULL;
ALTER TABLE processes ADD COLUMN equipment_notes TEXT NULL;
ALTER TABLE processes ADD COLUMN vendor_quote_url TEXT NULL;
