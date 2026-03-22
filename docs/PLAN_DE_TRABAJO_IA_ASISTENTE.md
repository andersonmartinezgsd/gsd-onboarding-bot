# PLAN DE TRABAJO - DESARROLLO AMROSAI-MVP
## Para ser ejecutado por IA Asistente

---

## CONTEXTO DEL PROYECTO

**Nombre:** AMROSAI-MVP-IT  
**Tipo:** Sistema de Orquestación de 87 Agentes AI  
**Stack:** Python/FastAPI + Vue.js 3 + SQLite  
**Puerto Dev:** 42024  
**Puerto Prod:** 41014  

---

## TAREA 1: Completar Datos de Agentes (30 min)

### Objetivo
Cargar todos los skills, responsabilidades y recursos de training para los 87 agentes desde los archivos JSON.

### Archivos de entrada
- `data/training/IT_DEPARTMENT_COMPLETE_87_ROLES.json`
- `data/training/CEO_Training_Program.json`
- `data/training/CTO_Training_Program.json`
- `data/training/CFO_Training_Program.json`

### Pasos
1. Leer los archivos JSON de training
2. Parsear la estructura de cada rol
3. Extraer: technical_skills, soft_skills, responsibilities, training_resources
4. Actualizar la tabla `agents` en la base de datos con los campos:
   - `skills` (JSON array)
   - `responsibilities` (JSON array)  
   - `training_resources` (JSON object)

### Verificación
```bash
cd /home/anderson5/amrosai_stack/amrosai-mvp-dev
source venv/bin/activate
python -c "
import sqlite3, json
conn = sqlite3.connect('data/amrosai.db')
cursor = conn.cursor()
cursor.execute('SELECT id, skills FROM agents LIMIT 3')
for row in cursor.fetchall():
    print(f'{row[0]}: {len(json.loads(row[1]))} skills')
conn.close()
"
```

---

## TAREA 2: Modal Crear/Editar Agentes en Vue.js (1 hora)

### Objetivo
Crear un modal/componente para crear y editar agentes desde el frontend.

### Archivos a modificar
- `web/frontend/src/views/admin/AgentsView.vue`

### Pasos
1. Añadir botón "Nuevo Agente" en la toolbar
2. Crear componente `AgentModal.vue` con formulario:
   - ID (auto-generado o manual)
   - Name
   - Role/Title
   - Department
   - Status (active/inactive)
   - Skills (array, editable)
   - Capabilities (JSON editor)
   - Model Assignment (provider, model)
3. Crear función de edición que cargue datos existentes
4. Conectar con API endpoints:
   - POST `/api/v1/agents` para crear
   - PUT `/api/v1/agents/{id}` para actualizar
   - DELETE `/api/v1/agents/{id}` para eliminar

### API参考
```javascript
// POST /api/v1/agents
{
  "id": "NEW-001",
  "name": "New Agent",
  "role": "Developer",
  "department": "Engineering",
  "status": "inactive",
  "capabilities": [],
  "model_assignment": {"provider": "ollama", "model": "llama3"}
}
```

---

## TAREA 3: Implementar Sistema de Task Queue (2 horas)

### Objetivo
Crear sistema de colas para que los agentes ejecuten tareas asíncronas.

### Archivos a crear
- `src/domain/services/task_queue.py`
- `src/interfaces/api/v1/routes/tasks.py`

### Estructura de la tabla
```sql
CREATE TABLE IF NOT EXISTS agent_tasks (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    task_type TEXT NOT NULL,
    payload TEXT,
    status TEXT DEFAULT 'pending',
    result TEXT,
    created_at TEXT,
    completed_at TEXT,
    error TEXT
);
```

### API Endpoints a crear
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/tasks` | Crear nueva tarea |
| GET | `/api/v1/tasks` | Listar tareas |
| GET | `/api/v1/tasks/{id}` | Obtener tarea por ID |
| GET | `/api/v1/tasks/agent/{agent_id}` | Tareas de un agente |
| DELETE | `/api/v1/tasks/{id}` | Cancelar tarea |

### Lógica
1. Task se crea con status "pending"
2. Worker procesa la tarea (simular con sleep aleatorio)
3. Actualiza status a "processing", luego "completed" o "failed"
4. Guardar resultado en campo `result` o `error`

---

## TAREA 4: Notificaciones WebSocket (1 hora)

### Objetivo
Implementar WebSocket para notificaciones en tiempo real.

### Archivos a modificar
- `src/main.py` - Añadir WebSocket route
- `web/frontend/src/services/websocket.js` - Cliente WebSocket

### Pasos Backend
1. Añadir dependencia: `pip install websockets`
2. Crear endpoint WebSocket en `src/main.py`:
```python
from fastapi import WebSocket

@app.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        # Procesar mensaje
```

### Pasos Frontend
1. Crear servicio `web/frontend/src/services/websocket.js`:
```javascript
class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = [];
  }
  
  connect() {
    this.ws = new WebSocket(`ws://${window.location.host}/ws/notifications`);
    this.ws.onmessage = (event) => {
      this.listeners.forEach(cb => cb(JSON.parse(event.data)));
    };
  }
  
  onMessage(callback) {
    this.listeners.push(callback);
  }
}
```

---

## TAREA 5: Perfil de Usuario (30 min)

### Objetivo
Permitir editar perfil de usuario desde el frontend.

### Archivos a modificar
- `web/frontend/src/views/auth/ProfileView.vue` (crear)
- `web/frontend/src/router/index.js` - Añadir ruta
- `src/interfaces/api/v1/routes/users.py` - Añadir endpoint

### API Endpoints
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Obtener perfil actual |
| PUT | `/api/v1/users/me` | Actualizar perfil |

---

## TAREA 6: Desplegar a Producción (30 min)

### Objetivo
Iniciar servidor en puerto 41014 con configuración de producción.

### Pasos
1. Verificar que no haya errores:
```bash
cd /home/anderson5/amrosai_stack/amrosai-mvp-dev
source venv/bin/activate
python -c "from src.main import app; print('OK')"
```

2. Iniciar servidor producción:
```bash
source venv/bin/activate
# Puerto 41014
uvicorn src.main:app --host 0.0.0.0 --port 41014 --workers 4
```

3. Verificar:
```bash
curl http://localhost:41014/health
curl http://localhost:41014/api/v1/agents | head -c 200
```

---

## ORDEN DE EJECUCIÓN RECOMENDADO

```
1. Completar Datos de Agentes (30 min)
       ↓
2. Modal Crear/Editar Agentes (1 hora)
       ↓
3. Task Queue (2 horas)
       ↓
4. WebSocket Notificaciones (1 hora)
       ↓
5. Perfil de Usuario (30 min)
       ↓
6. Desplegar Producción (30 min)
```

**Tiempo total estimado:** 5.5 horas

---

## COMANDOS DE VERIFICACIÓN

### Servidor activo
```bash
curl http://localhost:42024/health
# Expected: {"status":"healthy","version":"1.0.0",...}
```

### API agentes
```bash
curl http://localhost:42024/api/v1/agents | jq '. | length'
# Expected: 87
```

### Frontend
```bash
curl http://localhost:42024/app
# Expected: HTML con Vue.js app
```

### Base de datos
```bash
sqlite3 data/amrosai.db "SELECT COUNT(*) FROM agents;"
# Expected: 87
```

---

## NOTAS IMPORTANTES

1. **Entorno Virtual:** Siempre usar `source venv/bin/activate` antes de ejecutar Python
2. **Puerto Dev:** 42024 está configurado para desarrollo
3. **Puerto Prod:** 41014 es para producción
4. **PYTHONPATH:** Necesario para imports: `export PYTHONPATH=/home/anderson5/amrosai_stack/amrosai-mvp-dev`
5. **Vue.js:** Frontend está en `web/frontend/`, construido en `web/app/`

---

## ERRORES COMUNES Y SOLUCIONES

| Error | Solución |
|-------|----------|
| ModuleNotFoundError: src | Exportar PYTHONPATH |
| sqlite3.OperationalError | Verificar path en settings.py |
| Vue build fails | `cd web/frontend && npm run build` |
| CORS errors | Verificar origins en settings.py |
| Port in use | `pkill -f uvicorn` para matar procesos |

---

*Plan generado para ejecución por IA asistente*
*Fecha: 22 Febrero 2026*
