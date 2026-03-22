# HISTORICO DE AVANCE - APP AMROSAI (DEV)

## 1. Metadata
- Proyecto: `amrosai-mvp-dev-v1`
- Entorno: `dev`
- Puerto dev: `42024`
- Rama de trabajo: `codex/deb-fea-proceso-agentiq-dev`
- Fecha de corte: `2026-02-23 08:55 -05`
- Autor de ejecucion tecnica: Codex

## 2. Resumen ejecutivo
Este ciclo consolida tres objetivos principales:
1. Separacion estricta de superficies: `APP`, `API`, `DOCS`.
2. Seguridad de acceso: API por token, APP por sesion web, docs protegida.
3. UI/UX administrativa moderna con foco en gestion de agentes y acceso de admin.

Estado al cierre:
- `APP`: activa en `/app` (login + dashboard + acciones).
- `API`: activa en `/api/v1/*` y protegida por `X-App-Id` + `X-API-Token`.
- `DOCS`: activa en `/docs` y protegida (sin acceso anonimo).
- `openapi.json`: protegido (401 sin autenticacion).

## 3. Linea de tiempo de implementacion

### 3.1 Baseline y verificacion documental
Se revisaron reportes base:
- `MVP_COMPLETION_REPORT.md`
- `REPORTE_AGENTES_SIN_HABILIDADES.md`
- `REPORTE_COMPLETO_SISTEMA.md`
- `docs/propuesta/FEA_DEV_NUEVO_PROCESO_AGENTIQ.md`

Resultado:
- Se confirmo necesidad de unificar superficie web y de endurecer seguridad.
- Se detecto deriva entre DBs (`data/AMROSAI.db`, `data/amrosai.db`, `data/amrosai_dev.db`).

### 3.2 Integracion AgentIQ (backend)
Se integro modulo base de AgentIQ para DEV:
- Nuevo servicio: `src/extensions/agentiq/service.py`
- Nuevo router: `src/interfaces/api/v1/routes/agentiq.py`
- Wiring en app: `src/main.py`
- Tests unitarios: `tests/unit/test_agentiq_service.py`

### 3.3 Redisenio UI/UX de portal administrativo
Se implemento dashboard mas moderno y orientado a operacion:
- `web/templates/dashboard.html`
- Sidebar izquierda + header corporativo + menu de usuario + CTA de acceso admin.
- Enfoque en una sola APP web.

### 3.4 Separacion APP/API/DOCS y control de acceso
Se movio la capa web a router de APP dedicado:
- `src/interfaces/app/routes.py`
  - `/app/login` (GET/POST)
  - `/app/dashboard`
  - `/app/logout`
  - `/app/request-access`
  - `/app/data/*`
  - `/app/actions/*`

Cambios de arquitectura:
- `src/main.py`
  - `openapi_url=None`, `docs_url=None`, `redoc_url=None`.
  - Router APP montado en `/app`.
  - Routers API en `/api/v1` con dependencia `require_api_auth`.
  - `/docs` y `/openapi.json` con control de autenticacion (sesion o token).
- `src/interfaces/api/v1/routes/dashboard.py`
  - Eliminadas vistas HTML en API (`/api/v1/dashboard` deja de ser portal web).

### 3.5 Unificacion de DB canonica para auth
Se unifico origen auth a DB del entorno (`settings.database_url`):
- Nuevo utilitario: `src/infrastructure/auth/db_paths.py`
- `src/infrastructure/auth/app_manager.py`
  - usa DB canonica.
  - bootstrap de datos legacy si tabla destino esta vacia.
  - auto-promocion de una app admin activa para evitar lockout.
- `src/infrastructure/auth/api_keys.py`
  - usa DB canonica.
  - bootstrap de `api_keys` desde legacy cuando aplica.

## 4. Cambios tecnicos por archivo
- `src/main.py`
  - Arquitectura de superficies, seguridad de docs/openapi, proteccion API global.
- `src/interfaces/app/routes.py`
  - Portal APP completo (auth web + dashboard + data + acciones).
- `src/interfaces/api/v1/routes/dashboard.py`
  - API de datos solamente (sin HTML).
- `src/infrastructure/auth/db_paths.py`
  - Resolucion de rutas SQLite y bootstrap de migracion legacy.
- `src/infrastructure/auth/app_manager.py`
  - DB canonica + migracion + garantia de app admin.
- `src/infrastructure/auth/api_keys.py`
  - DB canonica + migracion de llaves legacy.
- `web/templates/app_login.html`
  - Pantalla login moderna para APP.
- `web/templates/dashboard.html`
  - Dashboard administrativo moderno.
- `docs/propuesta/FEA_DEV_NUEVO_PROCESO_AGENTIQ.md`
  - Actualizacion de avance ejecutado.

## 5. Matriz de validacion (evidencia)
Validaciones ejecutadas con `curl` en `http://127.0.0.1:42024`:

- `/api/v1/dashboard/data` sin token -> `401`
- `/api/v1/dashboard/data` con token -> `200`
- `/api/v1/dashboard` (vista vieja) -> `404`
- `/openapi.json` sin auth -> `401`
- `/openapi.json` con token -> `200`
- `/docs` sin auth -> `307` a login
- `/docs` con token -> `200`
- `/app/data/agents` sin sesion -> `401`
- `/app/data/agents` con sesion -> `200`
- `/api/v1/auth/status` -> `404` (ya no expuesto en API)

Tests:
- `PYTHONPATH=. .venv_codex/bin/pytest -q tests/unit/test_agentiq_service.py` -> `2 passed`

## 6. Incidente operativo: Login no carga
### 6.1 Sintoma reportado
- Navegador en `http://127.0.0.1:42024/app/login` con `ERR_CONNECTION_REFUSED`.

### 6.2 Diagnostico
- No habia proceso escuchando en el puerto `42024`.
- Esto no fue error de plantilla ni de ruta, fue backend detenido.

### 6.3 Verificacion tecnica
- Con backend arriba, `/app/login` responde `HTTP 200`.
- Se verifico contenido HTML de login renderizado correctamente.

### 6.4 Estado actual
- Proceso activo detectado:
  - PID: `76999`
  - Comando: `.venv_codex/bin/uvicorn src.main:app --host 127.0.0.1 --port 42024`

## 7. Runbook rapido (DEV)
### 7.1 Levantar backend
```bash
cd /Users/andersonmartinezrestrepo/DEV-PROJECTS/amrosai-mvp-dev-v1
PYTHONPATH=. .venv_codex/bin/uvicorn src.main:app --host 127.0.0.1 --port 42024
```

### 7.2 Verificar salud
```bash
curl http://127.0.0.1:42024/health
curl -I http://127.0.0.1:42024/app/login
```

### 7.3 Si el puerto ya esta ocupado
```bash
lsof -nP -iTCP:42024 -sTCP:LISTEN
kill -9 <PID>
```

## 8. Riesgos abiertos y seguimiento
- Persisten artefactos historicos en multiples DB (`AMROSAI.db`, `amrosai.db`, `amrosai_dev.db`).
- Falta formalizar pipeline CI para tests de seguridad y regresion.
- Faltan pruebas automatizadas de flujo web completo (login/dashboard/logout).

## 9. Proximos pasos recomendados
1. Agregar smoke tests HTTP para `APP/API/DOCS` en CI.
2. Definir script unico de arranque DEV con healthcheck.
3. Cerrar migracion de datos legacy a una sola DB canonica en DEV.
4. Publicar matriz de permisos por rol (`user/demo/admin/superadmin`) como documento operativo.

## 10. Actualizacion FEA-DEV-002 (2026-02-23)
Objetivo ejecutado: implementar flujo de aprobaciones para solicitud de rol admin dentro de APP, con auditoria y bandeja para administradores.

### 10.1 Cambios funcionales aplicados
- Backend (`/src/interfaces/app/routes.py`):
  - Migracion de esquema para `access_requests`:
    - nuevas columnas `resolution_note`, `requested_scope`, `source`
    - indices por `email`, `status`, `requested_at`
  - Nueva tabla `access_request_audit` para trazabilidad de decisiones.
  - Endpoints nuevos:
    - `GET /app/data/access-request/status`
    - `GET /app/admin/access-requests/metrics`
    - `GET /app/admin/access-requests`
    - `GET /app/admin/access-requests/{request_id}/audit`
    - `POST /app/admin/access-requests/{request_id}/approve`
    - `POST /app/admin/access-requests/{request_id}/reject`
  - Refuerzo de seguridad:
    - sanitizacion de texto de entrada
    - validacion de rol admin/superadmin para aprobar o rechazar
    - bloqueo de solicitudes duplicadas pendientes por email+rol
    - upsert en `authorized_users` al aprobar

- UI (`/web/templates/dashboard.html`):
  - Se conserva la visual base aprobada.
  - Se agrega panel de aprobaciones admin:
    - metricas (pending/approved/rejected/SLA)
    - filtros por estado
    - tabla de solicitudes
    - acciones aprobar/rechazar/ver auditoria
  - Estado de solicitud ya no depende de `localStorage`; se consulta backend.

### 10.2 Integridad UI lock
- Se recalculo hash de dashboard en:
  - `/src/shared/config/settings.py`
- Hash actualizado:
  - `ui_dashboard_template_sha256=cd1e734da9c1d707ebf8cac66320fadb4619f07e62e81b923a6f46a776bad750`

### 10.3 Validacion tecnica de FEA-DEV-002
- `PYTHONPATH=. .venv_codex/bin/python -m compileall -q src` -> OK
- `PYTHONPATH=. .venv_codex/bin/pytest -q tests/unit/test_agentiq_service.py` -> `2 passed`
- HTTP checks:
  - `/app/login` -> `200`
  - `/app/data/access-request/status` (sesion admin) -> `200`
  - `/app/admin/access-requests/metrics` (sesion admin) -> `200`
  - `/app/admin/access-requests?status=all&limit=10` (sesion admin) -> `200`
  - `/openapi.json` anonimo -> `401`
- Flujo E2E:
  - aprobar solicitud -> `200`
  - rechazar solicitud -> `200`
  - auditoria -> `200`
  - verificado registro en DB de estado + audit trail

## 11. Limpieza de repositorio (artefactos)
Objetivo ejecutado: remover artefactos de cache Python rastreados por git, sin cambios de funcionalidad.

- Accion:
  - eliminado tracking de `__pycache__/` y `*.pyc` versionados.
- Alcance:
  - `3189` archivos eliminados del indice git.
  - incluye artefactos de app y `venv`.
- Resultado:
  - historial limpio para evitar ruido de binarios de cache.

## 12. Trazabilidad Git (corte 2026-02-23)
- `4a32f52` - `feat(app): implement admin role approvals workflow`
- `41c443b` - `chore(repo): clean tracked pycache artifacts`

## 13. Nuevos FEAT APP (2026-02-23)
Se implementaron nuevos módulos funcionales en el portal APP manteniendo la visual base:

1. Perfil de cuenta.
2. Configuración de empresa.
3. Preferencias de notificación.
4. Seguridad y sesiones.
5. Clientes (acceso por agente o departamento).
6. Cierre de sesión (se mantiene operativo).

### 13.1 Backend agregado
Archivo principal:
- `/src/interfaces/app/routes.py`

Cambios:
- Autenticación APP con sesión server-side (`session_id` + tabla de sesiones).
- Dependencia unificada de auth APP para endpoints web (`_require_app_auth`).
- Nuevo esquema APP (prefijo `app_` para evitar colisiones con tablas legacy):
  - `app_user_profiles`
  - `app_company_settings`
  - `app_notification_preferences`
  - `app_web_sessions`
  - `app_client_accounts`
  - `app_client_access_grants`
- Endpoints nuevos:
  - `GET/POST /app/settings/profile`
  - `GET/POST /app/settings/company`
  - `GET/POST /app/settings/notifications`
  - `GET /app/settings/security-sessions`
  - `POST /app/settings/security-sessions/revoke`
  - `POST /app/settings/security-sessions/revoke-all`
  - `GET /app/clients`
  - `POST /app/clients`
  - `POST /app/clients/{client_id}/status`
  - `POST /app/clients/{client_id}/access`
  - `DELETE /app/clients/{client_id}/access/{access_id}`

### 13.2 Frontend agregado
Archivo principal:
- `/web/templates/dashboard.html`

Cambios:
- Menú de usuario enlazado a nuevas secciones.
- Sidebar con acceso directo a `Clientes`.
- Nuevas secciones UI:
  - `Perfil de cuenta`
  - `Configuración de empresa`
  - `Preferencias de notificación`
  - `Seguridad y sesiones`
  - `Clientes y accesos`
- Nuevos formularios/tablas conectados vía fetch a endpoints APP.

### 13.3 Seguridad y compatibilidad
- Se conservó separación de superficies APP/API/DOCS.
- API sigue protegida por token.
- APP maneja sesión web y validación de autorización.
- Se evitó conflicto con tablas existentes usando prefijo `app_`.

### 13.4 Validación técnica ejecutada
- `compileall src` -> OK
- `pytest tests/unit/test_agentiq_service.py` -> `2 passed`
- Check sintáctico JS de dashboard (`node --check`) -> OK
- Smoke con `TestClient`:
  - login APP -> `303` (redirige dashboard)
  - dashboard -> `200`
  - profile/company/notifications/sessions -> `200`
  - clients (listar/crear/asignar acceso/estado) -> `200`
  - logout -> `303` (redirige login)

### 13.5 UI contract lock
- Hash dashboard actualizado en:
  - `/src/shared/config/settings.py`
- Valor:
  - `ui_dashboard_template_sha256=1879b4efe8d9d8889f415153b910446da2624d0bbc02837a2850e435d471afae`
