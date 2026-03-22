# GSD API - Documentación para Integración

## URL Base

```
http://localhost:41014
```

---

## Endpoints

### Health Check
```bash
GET http://localhost:41014/health
```
Respuesta:
```json
{"status": "healthy", "timestamp": "2026-02-12T06:00:00Z", "version": "1.0.0"}
```

---

### Listar Agentes
```bash
GET http://localhost:41014/api/v1/agents
```
- **organization_id**: (opcional) ID de organización, por defecto 1
- **department**: (opcional) Filtrar por departamento
- **status**: (opcional) Filtrar por estado (active, inactive, busy)

**Ejemplo:**
```bash
curl "http://localhost:41014/api/v1/agents"
```

**Respuesta:**
```json
[
  {
    "id": "CEO-001",
    "name": "Chief Executive Officer",
    "role": "Chief Executive Officer",
    "department": "Executive",
    "status": "inactive",
    "organization_id": 1,
    "salary_range": {"min": 450000, "max": 600000, "currency": "USD"},
    "capabilities": [{"name": "Strategic Planning", "level": "expert"}],
    "current_tasks": [{"id": "task_123", "description": "...", "status": "assigned"}],
    "metrics": {},
    "created_at": "2026-02-12T11:25:06.644270",
    "updated_at": "2026-02-12T15:00:20.228660"
  }
]
```

---

### Obtener Agente Específico
```bash
GET http://localhost:41014/api/v1/agents/{agent_id}
```
**Ejemplo:**
```bash
curl "http://localhost:41014/api/v1/agents/SR-BACKEND-001"
```

---

### Activar Agente
```bash
POST http://localhost:41014/api/v1/agents/{agent_id}/activate
Content-Type: application/json

{"organization_id": 1}
```

---

### Desactivar Agente
```bash
POST http://localhost:41014/api/v1/agents/{agent_id}/deactivate
Content-Type: application/json

{"organization_id": 1}
```

---

### Asignar Tarea a Agente
```bash
POST http://localhost:41014/api/v1/agents/{agent_id}/assign-task
Content-Type: application/json

{
  "task": {
    "description": "Crear API REST con FastAPI",
    "priority": "high",
    "estimated_hours": 8
  },
  "organization_id": 1
}
```

**Respuesta:**
```json
{
  "status": "success",
  "agent_id": "SR-BACKEND-001",
  "task_id": "task_1770926420.228594",
  "message": "Task assigned successfully"
}
```

---

### Dashboard - Métricas
```bash
GET http://localhost:41014/api/v1/dashboard/data?organization_id=1
```

**Respuesta:**
```json
{
  "status": "success",
  "data": {
    "metrics": {
      "total_agents": 87,
      "active_agents": 9,
      "busy_agents": 0,
      "inactive_agents": 78,
      "total_tasks_completed": 0,
      "departments": {"Engineering": {"count": 25, "active": 5}}
    },
    "top_performers": [...],
    "timestamp": "2026-02-12T06:00:00Z"
  }
}
```

---

### Dashboard - Tiempo Real (SSE)
```bash
GET http://localhost:41014/api/v1/dashboard/real-time
```
*Actualiza cada 5 segundos*

---

### Fuentes de Datos (Data Sources)

#### Listar Fuentes
```bash
GET http://localhost:41014/api/v1/datasources?organization_id=1
```

#### Crear Fuente
```bash
POST http://localhost:41014/api/v1/datasources
Content-Type: application/json

{
  "name": "Mi API Externa",
  "source_type": "api",
  "description": "Fuente de datos",
  "config": {"url": "https://api.ejemplo.com/datos", "method": "GET"}
}
```

#### Probar Conexión
```bash
POST http://localhost:41014/api/v1/datasources/{source_id}/test
```

---

## Identificación de Agentes

### Estructura de ID
```
{PREFIX}-{DEPT}-{NUMBER}
```

**Prefijos:**
- `CEO`, `CTO`, `CFO`, `COO`, `CISO` - Ejecutivos
- `VP-` - Vice President
- `DIR-` - Director
- `SR-` - Senior
- `MID-` - Mid-level
- `JR-` - Junior

**Departamentos:**
- `ENG` - Engineering, `DATA` - Data, `SEC` - Security
- `SALES` - Sales, `MKT` - Marketing, `PROD` - Product
- `OPS` - Operations, `HR` - Human Resources, `FIN` - Finance

**Ejemplos:**
- `SR-BACKEND-001` - Senior Backend Engineer #1
- `JR-FRONTEND-002` - Junior Frontend Engineer #2
- `VP-ENG-001` - VP of Engineering

---

## Estados de Agentes

| Estado | Descripción |
|--------|-------------|
| `active` | Disponible |
| `inactive` | No disponible |
| `busy` | Trabajando |
| `maintenance` | En mantenimiento |

---

## Ejemplos de Código

### Python - Asignar tarea
```python
import requests

BASE_URL = "http://localhost:41014"

def assign_task(agent_id: str, task_description: str, priority: str = "medium"):
    url = f"{BASE_URL}/api/v1/agents/{agent_id}/assign-task"
    payload = {
        "task": {"description": task_description, "priority": priority, "estimated_hours": 8},
        "organization_id": 1
    }
    return requests.post(url, json=payload).json()

result = assign_task("SR-BACKEND-001", "Crear endpoint JWT", "high")
print(result)
```

### Python - Obtener agentes activos
```python
import requests

r = requests.get("http://localhost:41014/api/v1/agents?status=active")
active_agents = r.json()
print(f"Agentes activos: {len(active_agents)}")
```

---

## Documentación Interactiva

Accede a **http://localhost:41014/docs** para la documentación Swagger UI interactiva.

---

## Dashboard

- **Dashboard**: http://localhost:41014/
- **Data Sources**: http://localhost:41014/web/datasources.html

---

## Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | Éxito |
| 400 | Error en solicitud |
| 404 | No encontrado |
| 500 | Error interno |

---

## Sistema de Autoaprendizaje

### Niveles de Agentes
- **junior** → **mid_level** → **senior** → **expert** → **master**

### XP por Evento
| Evento | XP |
|--------|-----|
| Task Completed | +10 |
| Error Corrected | +25 |
| New Solution | +30 |
| Skill Learned | +50 |
| Task Failed | -5 |

---

### Obtener Aprendizaje de Agente
```bash
GET http://localhost:41014/api/v1/learning/{agent_id}
```

**Ejemplo:**
```bash
curl "http://localhost:41014/api/v1/learning/SR-BACKEND-001"
```

**Respuesta:**
```json
{
  "agent_id": "SR-BACKEND-001",
  "level": "junior",
  "xp": 10,
  "xp_to_next_level": 90,
  "skills": {},
  "completed_tasks": 1,
  "errors_corrected": 0,
  "solutions_implemented": 0,
  "top_skills": []
}
```

---

### Registrar Evento de Aprendizaje
```bash
POST http://localhost:41014/api/v1/learning/{agent_id}/event?event_type=task_completed&description=Tarea%20completada
```

**Tipos de eventos:**
- `task_completed` - Tarea completada
- `task_failed` - Tarea fallida
- `error_corrected` - Error corregido
- `new_solution` - Nueva solución implementada
- `skill_learned` - Habilidad aprendida

---

### Evaluación de Agente
```bash
POST http://localhost:41014/api/v1/learning/{agent_id}/evaluate
```

**Respuesta:**
```json
{
  "agent_id": "SR-BACKEND-001",
  "metrics": {
    "xp": 10,
    "level": "junior",
    "completed_tasks": 1,
    "score": 4.0
  },
  "recommendations": ["Completar más tareas para ganar XP"],
  "improvements": []
}
```

---

### Evaluación Nocturna (Todos los Agentes)
```bash
POST http://localhost:41014/api/v1/learning/evaluate-all
```

---

### Análisis ML
```bash
GET http://localhost:41014/api/v1/learning/{agent_id}/ml-analysis
```
*Requiere modelo ONNX en `/assets/modnet.onnx`*

---

## Notas

- El sistema de autoaprendizaje registra cada interacción
- Los agentes ganan XP y pueden subir de nivel automáticamente
- La evaluación nocturna analiza fortalezas y debilidades
- Las recomendaciones se generan basadas en el rendimiento
