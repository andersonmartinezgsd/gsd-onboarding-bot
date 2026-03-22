# Reporte Launch Readiness + Prompts + Demo Endpoint (2026-02-24)

## 1) Para qué sirve el sistema (visión operativa)
AMROSAI-MVP-IT es una plataforma de orquestación de agentes AI empresariales que permite:
- administrar un roster de agentes por rol/departamento,
- asignar y monitorear tareas,
- validar desempeño por evidencias,
- entrenar agentes de forma continua,
- exponer un chatbot y chat de orientación por agente con flujo `DB -> LLM -> Web`.

## 2) Validación de datos basada en scripts y estado actual

### Scripts auditados (`/scripts`)
- `populate_87_agents.py`: crea los 87 agentes base (ID, rol, capabilities, responsabilidades, estado).
- `load_real_agent_data.py`: sincroniza datos reales desde JSON de training.
- `training_manager.py`, `nightly_agent_training.py`, `nightly_self_learning.py`: entrenamiento/evaluación continua.
- `task_guardian.py`, `scale_tasks_for_all_agents.py`, `load_balancer.py`: monitoreo y ejecución operativa.

### Hallazgo clave
El script `populate_87_agents.py` sí crea capabilities/responsabilidades por agente, pero no llena completamente perfiles enriquecidos (`documents_json`, `skills_json`, `specialties_json`, `functions_json`, `trainer_name`) en `app_agent_profiles`.

### Snapshot de base DEV (`data/DAMROSAI.db`)
- Agentes totales: **87**
- Activos: **13**
- Busy: **1**
- Perfiles en `app_agent_profiles`: **87**
- Perfiles con documentación: **87**
- Perfiles con skills: **87**
- Perfiles con trainer: **87**
- Tareas totales: **5** (`in_progress=4`, `completed=1`)
- Readiness report: **95.0** (después de bootstrap de perfiles)

## 3) Revisión del catálogo externo de prompts
Ruta verificada:
- `/Users/andersonmartinezrestrepo/DEV-PROJECTS/system-prompts-and-models-of-ai-tools-main`

Aprovechamiento recomendado para AMROSAI:
- **Codex CLI / Gemini CLI / Claude Code**: estructura de ejecución, herramientas y guardrails.
- **Perplexity**: reglas de búsqueda y trazabilidad de fuentes web.
- **Manus Agent Loop / Cursor Agent Prompt**: ciclos autónomos y checklists de resolución.

Aplicación directa en producto:
- estandarizar prompt del chat de orientación por rol/departamento,
- usar guardrails de no alucinación + evidencia explícita,
- activar fallback web controlado con referencias,
- guardar interacción como señal de entrenamiento/IQ.

## 4) Gap de lanzamiento (pendiente para “100% funcional”)
1. Validaciones por agente todavía insuficientes para cerrar evidencia de desempeño global.
2. Falta automatización recurrente completa del training por prioridad en todos los agentes.
3. Endurecer checklist de salida: smoke tests APP/API y política de rollback por ambiente.
4. Aumentar observabilidad de latencia/calidad por canal (`internal`, `ollama`, `internet`).

## 5) Mejoras prioritarias sugeridas
1. Forzar al menos 1 validación guiada por agente en un ciclo inicial.
2. Programar workflow n8n de training periódico (high/medium/low priority).
3. Mantener trazabilidad de respuestas del chatbot con fuente (`internal`, `ollama`, `internet`).
4. Integrar gating de release con score de readiness y checks críticos.
5. Programar re-bootstrap incremental para nuevos agentes y cambios de rol.

## 6) Endpoint de versiones demo habilitado
Se habilitaron endpoints para exponer la matriz demo por rama/ambiente:
- `GET /app/data/demo/versions` (portal APP)
- `GET /api/v1/dashboard/demo-versions` (API token)

Incluyen:
- versión demo por `main/staging/dev`,
- URLs de APP/API/DOCS/HEALTH,
- base de datos asociada por ambiente,
- estado activo vs disponible.

## 7) Endpoint de readiness habilitado
- `GET /app/data/system/launch-readiness`

Entrega:
- score de readiness,
- checks (`ok/warning/critical`),
- pendientes para lanzamiento,
- snapshot de agentes/tareas/workflows,
- inventario scripts/docs/training,
- recomendaciones de prompts desde catálogo externo.

## 8) Endpoint de bootstrap de perfiles (para cerrar brecha de skills/docs)
- `POST /app/actions/agents/bootstrap-profiles` (solo `admin/superadmin`)

Objetivo:
- poblar perfiles faltantes de los 87 agentes sin sobrescribir lo ya cargado manualmente,
- completar trainer + docs + skills + specialties + functions desde capabilities/responsabilidades y JSON de training.
