-- =============================================================================
--  HR Onboarding/Offboarding Bot — MySQL Schema
--  Hostinger: crear DB "u548288135_hrbot" en hPanel → Databases
--  Importar este archivo vía phpMyAdmin o mysql CLI
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

-- ─── processes ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `processes` (
  `id`               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `process_type`     ENUM('onboarding','offboarding') NOT NULL,
  `status`           ENUM('pending','in_progress','completed','cancelled','failed')
                     NOT NULL DEFAULT 'pending',

  -- Cliente
  `client_name`      VARCHAR(255)    NOT NULL DEFAULT 'GSD',

  -- Datos del empleado
  `employee_name`    VARCHAR(255)    NOT NULL,
  `employee_email`   VARCHAR(255)    NOT NULL,
  `employee_slack`   VARCHAR(64)     NULL,
  `department`       VARCHAR(100)    NULL,
  `role_title`       VARCHAR(150)    NULL,
  `start_date`       DATE            NULL,
  `last_day`         DATE            NULL,

  -- Personas
  `manager_slack`    VARCHAR(64)     NULL,
  `file_transfer_to` VARCHAR(64)     NULL,

  -- Sistemas externos
  `github_username`  VARCHAR(100)    NULL,
  `google_email`     VARCHAR(255)    NULL,

  -- JSON arrays (herramientas, repos, canales)
  `tools_json`       JSON            NOT NULL,
  `repos_json`       JSON            NOT NULL,
  `channels_json`    JSON            NOT NULL,

  -- Offboarding
  `offboard_reason`  VARCHAR(100)    NULL,

  -- Referencias Slack
  `slack_channel`    VARCHAR(64)     NULL,
  `slack_ts`         VARCHAR(32)     NULL,

  -- Auditoría
  `initiated_by`     VARCHAR(64)     NULL,
  `meta_json`        JSON            NULL,
  `created_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_process_type`   (`process_type`),
  INDEX `idx_status`         (`status`),
  INDEX `idx_employee_email` (`employee_email`),
  INDEX `idx_created_at`     (`created_at`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── steps ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `steps` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `process_id`    INT UNSIGNED  NOT NULL,
  `step_key`      VARCHAR(100)  NOT NULL,
  `step_label`    VARCHAR(255)  NOT NULL,
  `status`        ENUM('pending','in_progress','waiting_actor','completed','failed','skipped')
                  NOT NULL DEFAULT 'pending',
  `actor`         VARCHAR(50)   NULL COMMENT 'hr | it | manager | finance',
  `assigned_to`   VARCHAR(64)   NULL,
  `result_json`   JSON          NULL,
  `error_message` TEXT          NULL,
  `started_at`    DATETIME      NULL,
  `completed_at`  DATETIME      NULL,
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_process_step` (`process_id`, `step_key`),
  INDEX `idx_process_id` (`process_id`),
  INDEX `idx_status`     (`status`),

  CONSTRAINT `fk_steps_process`
    FOREIGN KEY (`process_id`) REFERENCES `processes` (`id`)
    ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── schema_migrations (control de versiones) ────────────────────────────────
CREATE TABLE IF NOT EXISTS `schema_migrations` (
  `version`    VARCHAR(50)  NOT NULL,
  `applied_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `schema_migrations` (`version`) VALUES ('001_initial');

SET foreign_key_checks = 1;
