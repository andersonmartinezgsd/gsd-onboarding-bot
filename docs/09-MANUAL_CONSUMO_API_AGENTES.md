# Manual de Consumo de APIs y Agentes (Servicios Externos)

## 1) Objetivo

Este manual define la forma recomendada para integrar servicios externos con AMROSAI-MVP-IT, consumiendo APIs de agentes, tareas y AgentIQ de forma segura.

## 2) URL base por ambiente

- `MAIN` (producción): `http://127.0.0.1:41014`
- `STAGING`: `http://127.0.0.1:43034`
- `DEV`: `http://127.0.0.1:42024`

API base:

```text
{BASE_URL}/api/v1
```

## 3) Autenticación obligatoria (M2M)

Las rutas API `/api/v1/*` requieren estos headers:

- `X-App-Id: <app_id>`
- `X-API-Token: <api_token>`

Flujo de credenciales:

1. Crear/administrar app cliente desde `Config y Admin` en el portal o vía endpoint admin.
2. Guardar `app_id` + `api_token` en secret manager.
3. Enviar ambos headers en cada request.

Ejemplo cURL:

```bash
curl -X GET "http://127.0.0.1:42024/api/v1/agents?organization_id=1" \
  -H "X-App-Id: TU_APP_ID" \
  -H "X-API-Token: TU_API_TOKEN"
```

## 4) Endpoints clave para servicios externos

### 4.1 Agentes

- `GET /api/v1/agents`
- `GET /api/v1/agents/{agent_id}`
- `POST /api/v1/agents/{agent_id}/activate`
- `POST /api/v1/agents/{agent_id}/deactivate`
- `POST /api/v1/agents/{agent_id}/assign-task`
- `GET /api/v1/agents/metrics`
- `GET /api/v1/agents/top-performers`

Asignar tarea:

```bash
curl -X POST "http://127.0.0.1:42024/api/v1/agents/MID-BACKEND-001/assign-task" \
  -H "Content-Type: application/json" \
  -H "X-App-Id: TU_APP_ID" \
  -H "X-API-Token: TU_API_TOKEN" \
  -d '{
    "task": {
      "description": "Validar conexiones internas de la APP",
      "priority": "high",
      "estimated_hours": 2
    },
    "organization_id": 1
  }'
```

### 4.2 Dashboard/Operación

- `GET /api/v1/dashboard/data`
- `GET /api/v1/dashboard/real-time`
- `GET /api/v1/dashboard/health`
- `GET /api/v1/dashboard/demo-versions`

### 4.3 AgentIQ

- `GET /api/v1/agentiq/{agent_id}/summary`
- `POST /api/v1/agentiq/{agent_id}/interaction`
- `POST /api/v1/agentiq/{agent_id}/benchmark`
- `GET /api/v1/agentiq/ranking`
- `POST /api/v1/agentiq/bootstrap`

Registrar interacción en AgentIQ:

```bash
curl -X POST "http://127.0.0.1:42024/api/v1/agentiq/MID-BACKEND-001/interaction" \
  -H "Content-Type: application/json" \
  -H "X-App-Id: TU_APP_ID" \
  -H "X-API-Token: TU_API_TOKEN" \
  -d '{
    "prompt": "Diseña estrategia para resolver latencia elevada",
    "response": "Priorizo profiling y optimización de consultas críticas",
    "performance_score": 0.82,
    "metadata": {"source": "external_service", "test_id": "perf-001"}
  }'
```

## 5) Chat y orientación

Para chat de orientación y chatbot del portal existen acciones en `/app/actions/*`, pero esas rutas usan sesión web (`cookie`) y están orientadas a UI interna.

Para integraciones backend a backend usar preferentemente:

- `/api/v1/agents/*`
- `/api/v1/agentiq/*`

## 6) Recomendaciones de integración

- Timeout recomendado por request: `10-15s`.
- Retries: `max 2` con backoff exponencial (`300ms`, `900ms`).
- Idempotencia: usar `task_id` externo en metadata cuando aplique.
- Auditoría: registrar `agent_id`, `request_id`, `latency_ms`, `status_code`.
- Seguridad: no registrar `X-API-Token` en logs.

## 7) Errores comunes

- `401`: credenciales inválidas o ausentes.
- `403`: credenciales sin permisos.
- `404`: agente o recurso no existe.
- `409`: conflicto de estado (ej. tarea ya cerrada).
- `500`: error interno; revisar logs backend.

## 8) Regla crítica de base de datos por rama

- `MAIN -> data/AMROSAI.db`
- `STAGING -> data/SAMROSAI.db`
- `DEV -> data/DAMROSAI.db`

No mezclar DBs entre ramas para mantener coherencia de datos y pruebas.
