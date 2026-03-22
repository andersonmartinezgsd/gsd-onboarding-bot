# GSD API - Guía de Integración para Clientes

## Introducción

Esta guía explica cómo autenticarse y usar la API de Agentes GSD desde proyectos externos.

## Autenticación

### 1. Obtener tu API Key

Contacta con el administrador para obtener tu API Key. Recibirás un identificador único como:

```
amr_H_x5u6qoNVOvq9mOF9mnWa0CtwgkLWATDNjxms2U4P4
```

### 2. Usar la API

Incluye tu API Key en el header de cada petición:

```bash
curl http://localhost:45054/api/v1/agents \
  -H "X-API-Key: TU_API_KEY_AQUI"
```

### 3. Ejemplo en JavaScript

```javascript
const API_KEY = 'amr_TU_API_KEY';
const API_BASE = 'http://localhost:45054/api/v1';

async function fetchAgents() {
  const response = await fetch(`${API_BASE}/agents?organization_id=1`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  return await response.json();
}
```

### 4. Ejemplo en Python

```python
import requests

API_KEY = 'amr_TU_API_KEY'
API_BASE = 'http://localhost:45054/api/v1'

headers = {'X-API-Key': API_KEY}
response = requests.get(f'{API_BASE}/agents', headers=headers)
agents = response.json()
```

## Endpoints Disponibles

### Agentes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/agents` | Listar todos los agentes |
| GET | `/agents/{id}` | Obtener agente específico |
| GET | `/agents/{id}/iq` | Obtener IQ del agente |
| GET | `/learning/{agent_id}` | Obtener datos de aprendizaje |

### Training

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/training/assign` | Asignar entrenamiento |
| GET | `/training/programs` | Listar programas disponibles |

### Datos Sources

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/datasources` | Listar fuentes de datos |
| POST | `/datasources` | Crear fuente de datos |

## Monitoreo de Uso

Puedes verificar el estado de tu API Key:

```bash
curl http://localhost:45054/api/v1/api-keys/validate?api_key=TU_API_KEY
```

## Límites y Cuotas

- **Requests por minuto**: 100 (configurable)
- **API Key válida por**: 365 días
- **Agentes disponibles**: Según tu plan

## Solución de Problemas

### 401 Unauthorized
Tu API Key es inválida o ha expirado. Contacta al administrador.

### 403 Forbidden
No tienes permiso para acceder a este recurso.

### 429 Too Many Requests
Has excedido el límite de requests. Espera un momento e intenta de nuevo.

## Contacto

Para soporte técnico y gestión de API Keys:
- Email: soporte@GSD.com
- Dashboard: http://localhost:41014/web/dashboard.html
