# 📘 DOCUMENTACIÓN TÉCNICA COMPLETA - AMROSAI MVP

**Versión:** 1.0.0  
**Fecha:** 22 de Febrero 2026  
**Proyecto:** AMROSAI - Agent Orchestration System  
**Estado:** MVP en Desarrollo

---

## 1. VISTA GENERAL DEL SISTEMA

### 1.1 Descripción

AMROSAI es un sistema de orquestación de agentes AI basado en una arquitectura limpia (Clean Architecture) con FastAPI. El sistema gestiona 87 agentes organizacionales con capacidades de autoaprendizaje, seguimiento de métricas en tiempo real y un sistema de entrenamiento extensible.

### 1.2 Características Principales

| Característica | Descripción |
|----------------|-------------|
| **87 Agentes Organizacionales** | Estructura jerárquica completa (C-Level → Junior) |
| **Sistema de Aprendizaje** | Gamificación con XP, niveles y habilidades |
| **Dashboard en Tiempo Real** | Métricas, gráficos y analytics |
| **API REST Completa** | Endpoints para todas las operaciones |
| **Autenticación** | OAuth Google + API Keys |
| **ML/IA** | Integración con Ollama y ONNX |

---

## 2. ARQUITECTURA

### 2.1 Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend | FastAPI | Latest |
| Base de datos | SQLite | 3.x |
| Frontend | Tailwind CSS | 4.x |
| Servidor | Uvicorn | Latest |
| ML | ONNX | Latest |
| ORM | aiosqlite | Latest |

### 2.2 Estructura de Capas (Clean Architecture)

```
src/
├── domain/                    # Entidades y lógica de negocio
│   ├── entities/             # Agent, DataSource
│   ├── repositories/        # Interfaces de repositorio
│   └── services/             # AgentOrchestrator, AgentLearning
├── application/               # Casos de uso
│   └── agents/               # GetAgentMetrics
├── infrastructure/            # Implementaciones externas
│   ├── persistence/          # SQLite repositories
│   ├── auth/                # Autenticación Google OAuth
│   └── ml/                  # Integración ONNX
└── interfaces/               # API REST
    └── api/v1/routes/
```

### 2.3 Patrones de Diseño Implementados

| Patrón | Ubicación | Descripción |
|--------|-----------|-------------|
| **Repository** | `src/domain/repositories/` | Abstracción de acceso a datos |
| **Factory** | `src/domain/services/` | Creación de agentes |
| **Observer** | `src/interfaces/api/` | Eventos en tiempo real (SSE) |
| **Strategy** | `src/domain/services/` | Algoritmos de aprendizaje |
| **DTO** | `src/interfaces/api/dto/` | Transformación de datos |

### 2.4 Principios SOLID Aplicados

- ✅ **S**ingle Responsibility: Cada clase tiene una responsabilidad
- ✅ **O**pen/Closed: Extensible sin modificar código existente
- ✅ **L**iskov Substitution: Interfaces genéricas
- ✅ **I**nterface Segregation: Módulos pequeños
- ✅ **D**ependency Inversion: Dependencia de abstracciones

---

## 3. COMPONENTES PRINCIPALES

### 3.1 Sistema de Agentes

- **Total de agentes:** 87
- **Estructura organizacional:**
  - C-Level Executives: 5 agentes
  - VP/Directors: 12 agentes
  - Senior Engineers: 15 agentes
  - Mid-Level Specialists: 20 agentes
  - Junior Staff: 35 agentes

### 3.2 Sistema de Aprendizaje (Gamificación)

- **Niveles:** JUNIOR → MID_LEVEL → SENIOR → EXPERT → MASTER
- **XP por eventos:**
  - TASK_COMPLETED: +10 XP
  - ERROR_CORRECTED: +25 XP
  - NEW_SOLUTION: +30 XP
  - SKILL_LEARNED: +50 XP
  - TASK_FAILED: -5 XP

### 3.3 Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **superadmin** | Administrador total | Crear/eliminar agentes, usuarios, API keys |
| **admin** | Administrador de operaciones | Gestionar agentes, usuarios, API keys |
| **demo** | Usuario de demostración | Ver y activar/desactivar agentes |

---

## 4. API ENDPOINTS

### 4.1 Agentes

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/agents` | GET | Listar todos los agentes |
| `/api/v1/agents/{id}` | GET | Obtener agente específico |
| `/api/v1/agents/{id}/activate` | POST | Activar agente |
| `/api/v1/agents/{id}/deactivate` | POST | Desactivar agente |
| `/api/v1/agents/{id}/assign-task` | POST | Asignar tarea |

### 4.2 Dashboard

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/dashboard/data` | GET | Métricas del dashboard |
| `/api/v1/dashboard/stream` | GET | Eventos en tiempo real (SSE) |
| `/api/v1/dashboard/health` | GET | Estado del sistema |

### 4.3 Aprendizaje

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/learning/{id}` | GET | Datos de aprendizaje |
| `/api/v1/learning/{id}/event` | POST | Registrar evento |
| `/api/v1/learning/{id}/evaluate` | POST | Evaluar agente |
| `/api/v1/training/assign` | POST | Asignar entrenamiento |

### 4.4 Administración

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/admin/apps` | GET/POST | Gestionar apps |
| `/api/v1/admin/users` | GET/POST | Gestionar usuarios |
| `/api/v1/api-keys` | GET/POST | Gestionar API Keys |

---

## 5. FRONTEND

### 5.1 Estructura

```
web/
├── pages/
│   ├── dashboard.html       # Dashboard principal
│   ├── admin/
│   │   └── dashboard.html  # Panel de admin
│   ├── analytics_dashboard.html
│   ├── datasources.html
│   ├── api_clients.html
│   └── chatbot.html
├── layouts/
│   └── index.html          # Plantilla base
├── components/             # Componentes reutilizables
├── assets/
│   ├── css/               # Estilos
│   └── js/                # Scripts
└── static/                # Archivos estáticos
```

### 5.2 Páginas Disponibles

| Página | Descripción |
|--------|-------------|
| `/` | Landing page |
| `/dashboard` | Dashboard principal |
| `/admin` | Panel de administración |
| `/analytics` | Analytics con Chart.js |
| `/datasources` | Gestión de fuentes de datos |
| `/api-clients` | Clientes API |
| `/chatbot` | Interfaz de chatbot |

---

## 6. SEGURIDAD

### 6.1 Autenticación

- **OAuth Google** para usuarios web
- **API Keys** para clientes externos
- **JWT Tokens** con expiración de 90 días

### 6.2 Rate Limiting

- 100 requests/minuto
- 1000 requests/hora

### 6.3 CORS

Configurado para múltiples puertos:
- localhost:41014
- localhost:42024
- localhost:43034

---

## 7. CONFIGURACIÓN

### 7.1 Variables de Entorno

```
ENVIRONMENT=production
API_PORT=41014
DATABASE_URL=sqlite:///./data/amrosai.db
OLLAMA_BASE_URL=http://localhost:11434
SECRET_KEY=your-secret-key
```

### 7.2 Puertos por Ambiente

| Ambiente | Puerto | Propósito |
|----------|--------|-----------|
| Production | 41014 | Servidor principal |
| Staging | 43034 | Pruebas pre-producción |
| Development | 42024 | Desarrollo local |

---

## 8. BASES DE DATOS

### 8.1 Esquema Principal

```sql
-- Agentes
agents (
    id, name, role, department, status,
    organization_id, capabilities, salary_min, salary_max,
    responsibilities, model_assignment, current_tasks, metrics,
    created_at, updated_at
)

-- Aprendizaje
agent_learning (
    agent_id, level, xp, skills, completed_tasks,
    errors_corrected, solutions_implemented, learning_history
)

-- Organizaciones
organizations (id, name, email, created_at, updated_at)

-- Fuentes de datos
data_sources (id, name, source_type, config, status, organization_id)

-- Usuarios autorizados
authorized_users (email, name, role, is_active, created_at)

-- API Keys
api_keys (app_id, app_name, api_token_hash, created_at, expires_at)
```

---

## 9. INTEGRACIONES

### 9.1 Servicios Externos

| Servicio | Estado | Notas |
|----------|--------|-------|
| Ollama (LLM) | ⚠️ Configurado | Requiere instalación local |
| ONNX (ML) | 🟢 Integrado | Modelo: modnet.onnx |
| Google OAuth | ⚠️ Requiere config | Keys no configuradas |

---

## 10. DESPLIEGUE

### 10.1 Production

```bash
cd /home/anderson5/amrosai_stack/amrosai-mvp-dev
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 41014
```

### 10.2 Desarrollo

```bash
uvicorn src.main:app --host 0.0.0.0 --port 42024
```

### 10.3 Staging

```bash
uvicorn src.main:app --host 0.0.0.0 --port 43034
```

---

## 11. CONTRIBUCIÓN

### 11.1 Estándares de Código

- PEP 8 para Python
- Type hints obligatorios
- Docstrings en todas las funciones
- Tests unitarios requeridos

### 11.2 Flujo Git

1. Crear branch `feature/nombre`
2. Desarrollar y testear
3. Crear Pull Request
4. Revisión de código
5. Merge a `dev`

---

## 12. LICENCIA

Copyright © 2026 AMROSAI Corporation. Todos los derechos reservados.

---

*Documento generado automáticamente - AMROSAI MVP 1.0.0*
