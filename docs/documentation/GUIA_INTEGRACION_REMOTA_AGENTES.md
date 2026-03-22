# 🔗 GUÍA DE INTEGRACIÓN REMOTA - AGENTES AI DESDE TU APP

**Versión**: 1.0  
**Fecha**: 24 de Febrero de 2026  
**Objetivo**: Integrar agentes AI de AMROSAI en tu aplicación OpenCode o cualquier otro proyecto

---

## 📋 TABLA DE CONTENIDOS

1. [Introducción](#introducción)
2. [Arquitectura de Integración](#arquitectura-de-integración)
3. [Prerequisitos](#prerequisitos)
4. [Configuración Inicial](#configuración-inicial)
5. [Ciclo de Vida de Agentes](#ciclo-de-vida-de-agentes)
6. [Ejemplos de Código](#ejemplos-de-código)
7. [Seguridad y API Keys](#seguridad-y-api-keys)
8. [Troubleshooting](#troubleshooting)

---

## INTRODUCCIÓN

Desde tu app **OpenCode** (o cualquier otro proyecto), puedes:

✅ **Activar agentes IT remotamente**  
✅ **Asignar tareas automáticamente**  
✅ **Monitorear progreso en tiempo real**  
✅ **Desactivar agentes cuando terminen**  
✅ **Recopilar resultados/logs**  

Todo a través de una **API REST segura con API Keys**.

---

## ARQUITECTURA DE INTEGRACIÓN

```
TU APP (OpenCode)                    AMROSAI MVP
┌─────────────────┐                 ┌─────────────────┐
│  OpenCode App   │                 │  AMROSAI Server │
│  ┌───────────┐  │                 │  ┌───────────┐  │
│  │ Button    │  │   HTTP REST     │  │ API v1    │  │
│  │"Fix Bug"  │  │   (API Keys)    │  │ Router    │  │
│  └─────┬─────┘  │   ─────────────► │  └─────┬───┘  │
│        │        │                 │        │       │
│        │        │                 │  ┌─────▼─────┐ │
│  ┌─────▼─────┐  │                 │  │Agent Mgr  │ │
│  │POST /api/ │  │                 │  │(87 roles) │ │
│  │activate   │  │                 │  └───┬───────┘ │
│  └───────────┘  │                 │      │         │
│        │        │                 │  ┌───▼─────┐   │
│  ┌─────▼─────┐  │                 │  │Database  │   │
│  │Monitor    │  │   ◄─────────────┤  │SQLite/PG │   │
│  │Status     │  │   poll status   │  └──────────┘   │
│  └───────────┘  │                 │                 │
└─────────────────┘                 └─────────────────┘

FLUJO:
1. OpenCode obtiene API_KEY
2. Envía POST /agents/{id}/activate
3. AMROSAI retorna confirmation
4. OpenCode asigna tarea con POST /agents/{id}/assign-task
5. Polling a GET /agents/{id} para status
6. Cuando termina: POST /agents/{id}/deactivate
```

---

## PREREQUISITOS

### 1. **Acceso a AMROSAI Server**

```
Base URL: http://localhost:41014
         o
         https://tu-dominio.com:41014
```

### 2. **API Key** (Desde Admin)

```bash
# El administrador genera tu API Key:
POST http://amrosai-server:41014/api/v1/api-keys/create

{
  "client_id": "opencode-dev",
  "client_name": "OpenCode Development Team"
}

RESPUESTA:
{
  "api_key": "amr_H_x5u6qoNVOvq9mOF9mnWa0CtwgkLWATDNjxms2U4P4",
  "expires_at": "2027-02-24T00:00:00Z"
}
```

### 3. **Dependencias** (según tu lenguaje)

**JavaScript/Node.js:**
```bash
npm install axios
# o
npm install fetch
```

**Python:**
```bash
pip install requests
```

**cURL:**
```bash
# No requiere dependencias
```

---

## CONFIGURACIÓN INICIAL

### JavaScript - Configurar Cliente

```javascript
// config.js
export const AMROSAI_CONFIG = {
  // URL del servidor AMROSAI
  BASE_URL: process.env.REACT_APP_AMROSAI_URL || 'http://localhost:41014',
  
  // Tu API Key (guardar en .env, NUNCA en código)
  API_KEY: process.env.REACT_APP_AMROSAI_KEY,
  
  // Organization ID (default 1)
  ORG_ID: process.env.REACT_APP_ORG_ID || 1,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.REACT_APP_AMROSAI_KEY
  }
};
```

```bash
# .env.local
REACT_APP_AMROSAI_URL=http://localhost:41014
REACT_APP_AMROSAI_KEY=amr_H_x5u6qoNVOvq9mOF9mnWa0CtwgkLWATDNjxms2U4P4
REACT_APP_ORG_ID=1
```

### Python - Configurar Cliente

```python
# config.py
import os
from typing import Optional

class AMROSAIConfig:
    BASE_URL = os.getenv('AMROSAI_URL', 'http://localhost:41014')
    API_KEY = os.getenv('AMROSAI_KEY')
    ORG_ID = int(os.getenv('AMROSAI_ORG_ID', '1'))
    
    HEADERS = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
    }
    
    # Validar que todo esté configurado
    @classmethod
    def validate(cls):
        if not cls.API_KEY:
            raise ValueError('AMROSAI_KEY not set in environment')
        print(f"✅ AMROSAI Config OK")
        print(f"   Base URL: {cls.BASE_URL}")
        print(f"   Organization: {cls.ORG_ID}")

# Validar al importar
AMROSAIConfig.validate()
```

```bash
# .env
AMROSAI_URL=http://localhost:41014
AMROSAI_KEY=amr_H_x5u6qoNVOvq9mOF9mnWa0CtwgkLWATDNjxms2U4P4
AMROSAI_ORG_ID=1
```

---

## CICLO DE VIDA DE AGENTES

### 🔄 Flujo Completo

```
┌─────────────┐
│   INICIO    │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│ 1. ACTIVAR AGENTE        │
│ POST /agents/{id}/       │
│       activate           │
│                          │
│ Status: inactive ──────► │
│         active           │
└──────┬───────────────────┘
       │
       ▼ (si activación OK)
┌──────────────────────────┐
│ 2. ASIGNAR TAREA         │
│ POST /agents/{id}/       │
│       assign-task        │
│                          │
│ Task status: pending ──► │
│              assigned    │
└──────┬───────────────────┘
       │
       ▼ (tarea asignada)
┌──────────────────────────┐
│ 3. MONITOREAR PROGRESO   │
│ GET /agents/{id}         │
│ (polling cada 2-5 seg)   │
│                          │
│ Status: active/busy      │
│ Progress: 0% → 100%      │
└──────┬───────────────────┘
       │
       ▼ (cuando status = completed o error)
┌──────────────────────────┐
│ 4. DESACTIVAR AGENTE     │
│ POST /agents/{id}/       │
│       deactivate         │
│                          │
│ Status: active ───────► │
│         inactive         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────┐
│   COMPLETO   │
└──────────────┘
```

---

## EJEMPLOS DE CÓDIGO

### ✨ JAVASCRIPT / REACT

#### Client Helper

```javascript
// services/amrosaiClient.js
import axios from 'axios';
import { AMROSAI_CONFIG } from '../config';

class AMROSAIClient {
  constructor(baseURL = AMROSAI_CONFIG.BASE_URL, apiKey = AMROSAI_CONFIG.API_KEY) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      timeout: 10000
    });
  }

  // 1. Listar agentes disponibles
  async getAgents(department = null) {
    try {
      const params = { organization_id: AMROSAI_CONFIG.ORG_ID };
      if (department) params.department = department;
      
      const response = await this.client.get('/api/v1/agents', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error.response?.data || error.message);
      throw error;
    }
  }

  // 2. Obtener detalles de un agente
  async getAgent(agentId) {
    try {
      const response = await this.client.get(`/api/v1/agents/${agentId}`, {
        params: { organization_id: AMROSAI_CONFIG.ORG_ID }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching agent ${agentId}:`, error.response?.data);
      throw error;
    }
  }

  // 3. Activar agente
  async activateAgent(agentId) {
    try {
      const response = await this.client.post(`/api/v1/agents/${agentId}/activate`, {
        organization_id: AMROSAI_CONFIG.ORG_ID
      });
      return response.data;
    } catch (error) {
      console.error(`Error activating agent ${agentId}:`, error.response?.data);
      throw error;
    }
  }

  // 4. Asignar tarea
  async assignTask(agentId, taskDescription, priority = 'medium', estimatedHours = 2) {
    try {
      const response = await this.client.post(
        `/api/v1/agents/${agentId}/assign-task`,
        {
          task: {
            description: taskDescription,
            priority,
            estimated_hours: estimatedHours
          },
          organization_id: AMROSAI_CONFIG.ORG_ID
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error assigning task:`, error.response?.data);
      throw error;
    }
  }

  // 5. Desactivar agente
  async deactivateAgent(agentId) {
    try {
      const response = await this.client.post(`/api/v1/agents/${agentId}/deactivate`, {
        organization_id: AMROSAI_CONFIG.ORG_ID
      });
      return response.data;
    } catch (error) {
      console.error(`Error deactivating agent ${agentId}:`, error.response?.data);
      throw error;
    }
  }

  // Helper: Monitorear agente hasta que complete
  async monitorAgent(agentId, maxAttempts = 30, delayMs = 2000) {
    console.log(`🔍 Monitoring agent ${agentId}...`);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const agent = await this.getAgent(agentId);
        console.log(`[${attempt + 1}/${maxAttempts}] Status: ${agent.status}`);
        
        // Si está completo o con error, retornar
        if (agent.status === 'completed' || agent.status === 'error') {
          return agent;
        }
        
        // Esperar antes del siguiente polling
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        console.error(`Monitoring error: ${error.message}`);
      }
    }
    
    throw new Error(`Timeout monitoring agent ${agentId}`);
  }
}

export default new AMROSAIClient();
```

#### Componente React

```javascript
// components/AgentTaskRunner.jsx
import React, { useState } from 'react';
import amrosaiClient from '../services/amrosaiClient';

export default function AgentTaskRunner() {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState([]);
  const [agents, setAgents] = useState([]);

  // Cargar agentes disponibles
  React.useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await amrosaiClient.getAgents();
      setAgents(data.filter(a => a.department.includes('Backend') || a.department.includes('Frontend')));
    } catch (error) {
      setErrors(prev => [...prev, `Failed to load agents: ${error.message}`]);
    }
  };

  // Button Click: Ejecutar tarea
  const handleRunTask = async () => {
    if (!selectedAgent || !taskDescription) {
      setErrors(prev => [...prev, 'Select agent and describe task']);
      return;
    }

    setLoading(true);
    setStatus('');
    setErrors([]);

    try {
      // 1. Activar agente
      setStatus('🟢 Activating agent...');
      const activateResult = await amrosaiClient.activateAgent(selectedAgent);
      console.log('✅ Agent activated:', activateResult);

      // 2. Asignar tarea
      setStatus('📋 Assigning task...');
      const taskResult = await amrosaiClient.assignTask(
        selectedAgent,
        taskDescription,
        'high',
        4
      );
      console.log('✅ Task assigned:', taskResult);

      // 3. Monitorear prog progreso
      setStatus('⏳ Monitoring progress...');
      const finalAgent = await amrosaiClient.monitorAgent(selectedAgent);
      console.log('✅ Task completed:', finalAgent);

      // 4. Desactivar
      setStatus('⛔ Deactivating agent...');
      const deactivateResult = await amrosaiClient.deactivateAgent(selectedAgent);
      console.log('✅ Agent deactivated:', deactivateResult);

      setStatus('✅ Task completed successfully!');
    } catch (error) {
      setErrors(prev => [...prev, `Error: ${error.message}`]);
      setStatus('❌ Task failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🤖 AI Agent Task Runner</h2>

      {/* Agent Selector */}
      <div style={{ marginBottom: '15px' }}>
        <label>Select Agent:</label>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          disabled={loading}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="">-- Choose Agent --</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              [{agent.department}] {agent.id} - {agent.name}
            </option>
          ))}
        </select>
      </div>

      {/* Task Description */}
      <div style={{ marginBottom: '15px' }}>
        <label>Task Description:</label>
        <textarea
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          disabled={loading}
          placeholder="e.g., Create API endpoint for user authentication"
          style={{ width: '100%', height: '80px', padding: '8px' }}
        />
      </div>

      {/* Run Button */}
      <button
        onClick={handleRunTask}
        disabled={loading || !selectedAgent || !taskDescription}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '⏳ Running...' : '▶️ Run Task'}
      </button>

      {/* Status */}
      {status && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#e8f4f8',
          borderRadius: '4px'
        }}>
          {status}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px'
        }}>
          {errors.map((err, i) => <div key={i}>❌ {err}</div>)}
        </div>
      )}
    </div>
  );
}
```

---

### 🐍 PYTHON

#### Client Helper

```python
# services/amrosai_client.py
import requests
import time
from typing import Optional, Dict, Any, List
from config import AMROSAIConfig

class AMROSAIClient:
    def __init__(self, base_url: str = AMROSAIConfig.BASE_URL, api_key: str = AMROSAIConfig.API_KEY):
        self.base_url = base_url.rstrip('/')
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': api_key
        }
        self.org_id = AMROSAIConfig.ORG_ID

    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        """Generic request maker with error handling"""
        url = f"{self.base_url}/api/v1{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=self.headers, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=self.headers, json=data, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error: {e}")
            raise

    # 1. Listar agentes
    def get_agents(self, department: Optional[str] = None) -> List[Dict]:
        """Get all agents, optionally filtered by department"""
        endpoint = f"/agents?organization_id={self.org_id}"
        if department:
            endpoint += f"&department={department}"
        
        return self._make_request('GET', endpoint)

    # 2. Obtener agente específico
    def get_agent(self, agent_id: str) -> Dict:
        """Get specific agent details"""
        endpoint = f"/agents/{agent_id}?organization_id={self.org_id}"
        return self._make_request('GET', endpoint)

    # 3. Activar agente
    def activate_agent(self, agent_id: str) -> Dict:
        """Activate an agent"""
        endpoint = f"/agents/{agent_id}/activate"
        data = {'organization_id': self.org_id}
        return self._make_request('POST', endpoint, data)

    # 4. Asignar tarea
    def assign_task(self, agent_id: str, description: str, priority: str = 'medium', 
                   estimated_hours: int = 2) -> Dict:
        """Assign a task to an agent"""
        endpoint = f"/agents/{agent_id}/assign-task"
        data = {
            'task': {
                'description': description,
                'priority': priority,
                'estimated_hours': estimated_hours
            },
            'organization_id': self.org_id
        }
        return self._make_request('POST', endpoint, data)

    # 5. Desactivar agente
    def deactivate_agent(self, agent_id: str) -> Dict:
        """Deactivate an agent"""
        endpoint = f"/agents/{agent_id}/deactivate"
        data = {'organization_id': self.org_id}
        return self._make_request('POST', endpoint, data)

    # 6. Monitorear agente
    def monitor_agent(self, agent_id: str, max_attempts: int = 30, 
                     delay_secs: float = 2.0) -> Dict:
        """Monitor agent progress until completion"""
        print(f"\n🔍 Monitoring agent {agent_id}...")
        
        for attempt in range(max_attempts):
            try:
                agent = self.get_agent(agent_id)
                status = agent.get('status', 'unknown')
                
                print(f"[{attempt + 1}/{max_attempts}] Status: {status}")
                
                # Si completó o error, retornar
                if status in ['completed', 'error']:
                    return agent
                
                time.sleep(delay_secs)
            
            except Exception as e:
                print(f"❌ Monitoring error: {e}")
        
        raise TimeoutError(f"Timeout monitoring agent {agent_id}")
```

#### Script de Uso

```python
# run_agent_task.py
from services.amrosai_client import AMROSAIClient

def main():
    client = AMROSAIClient()
    
    # 1. Listar agentes disponibles
    print("📋 Fetching available agents...\n")
    agents = client.get_agents()
    
    # Filtrar agentes de Backend
    backend_agents = [a for a in agents if 'Backend' in a.get('department', '')]
    
    if not backend_agents:
        print("❌ No backend agents available")
        return
    
    # Seleccionar el primero
    agent_id = backend_agents[0]['id']
    print(f"✅ Selected agent: {agent_id} - {backend_agents[0]['name']}\n")
    
    # 2. Activar agente
    print(f"🟢 Activating agent {agent_id}...")
    activate_result = client.activate_agent(agent_id)
    print(f"✅ {activate_result}\n")
    
    # 3. Asignar tarea
    task_desc = "Create REST API endpoint for user authentication with JWT tokens"
    print(f"📋 Assigning task: {task_desc}...")
    task_result = client.assign_task(agent_id, task_desc, priority='high', estimated_hours=4)
    print(f"✅ {task_result}\n")
    
    # 4. Monitorear progreso
    print("⏳ Monitoring progress...\n")
    final_agent = client.monitor_agent(agent_id)
    print(f"✅ Final status: {final_agent['status']}\n")
    
    # 5. Desactivar agente
    print(f"⛔ Deactivating agent {agent_id}...")
    deactivate_result = client.deactivate_agent(agent_id)
    print(f"✅ {deactivate_result}\n")
    
    print("🎉 Task completed successfully!")

if __name__ == '__main__':
    main()
```

---

### 📎 CURL / Command Line

```bash
#!/bin/bash
# run_agent.sh

# Variables
AMROSAI_URL="http://localhost:41014"
API_KEY="amr_H_x5u6qoNVOvq9mOF9mnWa0CtwgkLWATDNjxms2U4P4"
ORG_ID="1"
AGENT_ID="MID-BACKEND-001"

echo "🤖 AMROSAI Agent Task Runner"
echo "============================"

# 1. Listar agentes
echo -e "\n1️⃣  Listing agents..."
curl -s -X GET \
  "$AMROSAI_URL/api/v1/agents?organization_id=$ORG_ID" \
  -H "X-API-Key: $API_KEY" | jq '.[] | {id, name, department, status}' | head -20

# 2. Activar agente
echo -e "\n\n2️⃣  Activating agent $AGENT_ID..."
curl -s -X POST \
  "$AMROSAI_URL/api/v1/agents/$AGENT_ID/activate" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"organization_id\": $ORG_ID}" | jq .

# 3. Asignar tarea
echo -e "\n\n3️⃣  Assigning task..."
curl -s -X POST \
  "$AMROSAI_URL/api/v1/agents/$AGENT_ID/assign-task" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"task\": {
      \"description\": \"Create API endpoint for user authentication\",
      \"priority\": \"high\",
      \"estimated_hours\": 4
    },
    \"organization_id\": $ORG_ID
  }" | jq .

# 4. Monitorear (polling cada 2 segundos, máx 30 intentos)
echo -e "\n\n4️⃣  Monitoring progress..."
for i in {1..30}; do
  STATUS=$(curl -s -X GET \
    "$AMROSAI_URL/api/v1/agents/$AGENT_ID?organization_id=$ORG_ID" \
    -H "X-API-Key: $API_KEY" | jq -r '.status')
  
  echo "[$i/30] Status: $STATUS"
  
  if [[ "$STATUS" == "completed" ]] || [[ "$STATUS" == "error" ]]; then
    break
  fi
  
  sleep 2
done

# 5. Desactivar agente
echo -e "\n\n5️⃣  Deactivating agent..."
curl -s -X POST \
  "$AMROSAI_URL/api/v1/agents/$AGENT_ID/deactivate" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"organization_id\": $ORG_ID}" | jq .

echo -e "\n\n✅ Task completed!"
```

---

## SEGURIDAD Y API KEYS

### 🔐 Mejores Prácticas

#### **1. Nunca Exponer tu API Key**

```javascript
// ❌ MALO - No hacer esto
const API_KEY = "amr_H_x5u6qoNVOvq9mOF9mnWa0CtwgkLWATDNjxms2U4P4";

// ✅ BIEN - Usar variables de entorno
const API_KEY = process.env.REACT_APP_AMROSAI_KEY;
```

#### **2. Usar .env para configuración**

```bash
# .env (agregar a .gitignore)
AMROSAI_URL=http://localhost:41014
AMROSAI_KEY=amr_H_x5u6qoNVOvq9mOF9mnWa0CtwgkLWATDNjxms2U4P4
AMROSAI_ORG_ID=1

# .gitignore
.env
.env.local
.env.*.local
```

#### **3. Validar en Backend, no Frontend**

```javascript
// ❌ MALO - Exponer lógica de seguridad en frontend
if (apiKey === "amr_xxxx") {
  // permitir
}

// ✅ BIEN - Validar siempre en backend
// Backend valida que la API Key sea válida
```

#### **4. Rotar API Keys regularmente**

```bash
# Cada 90 días, regenerar API Key
POST /api/v1/api-keys/regenerate

{
  "client_id": "opencode-dev"
}
```

#### **5. Usar HTTPS en Producción**

```javascript
// ❌ MALO
const url = "http://amrosai-server.com/api/v1/agents";

// ✅ BIEN
const url = "https://amrosai-server.com/api/v1/agents";
```

### 🛡️ Headers de Seguridad

```bash
# SIEMPRE incluir headers
X-API-Key: amr_xxxxx
Content-Type: application/json

# CORS (si es cross-domain)
Origin: https://your-app.com
```

---

## TROUBLESHOOTING

### ❌ Error: 401 Unauthorized

```
Causa: API Key inválida, expirada o no enviada

Solución:
1. Verificar que X-API-Key esté en headers
2. Validar que el key no haya expirado
3. Regenerar API Key si es necesario

# Test
curl -X GET http://localhost:41014/api/v1/api-keys/validate?api_key=amr_xxxx
```

### ❌ Error: 403 Forbidden

```
Causa: No tienes permiso para esa acción

Solución:
1. Verificar tu rol (user, admin, superadmin)
2. Contactar admin para permisos
3. Usar API Key correcta para tu organización
```

### ❌ Error: 404 Not Found

```
Causa: Agente no existe o URL incorrecta

Solución:
1. Listar agentes: GET /api/v1/agents
2. Verificar agent_id exacto
3. Comprobar que agente esté en tu organización
```

### ❌ Error: 429 Too Many Requests

```
Causa: Excediste rate limit

Solución:
1. Esperar algunos segundos
2. Implementar exponential backoff
3. Contactar admin para aumentar cuota
```

### ❌ Error: Connection Timeout

```
Causa: Servidor no responde

Solución:
1. Verificar que AMROSAI servidor está activo
2. Comprobar URL y puerto (41014)
3. Verificar conectividad de red
4. Aumentar timeout si red es lenta

# Test de conectividad
curl -v http://localhost:41014/health
```

### ⚠️ Agente No Se Activa

```
Solución:
1. Verificar que agente existe: GET /agents/{id}
2. Comprobar status actual
3. Si ya está activo, no puede activarse de nuevo
4. Ver logs del servidor para errores

Script de debug:
bash check_agent.sh <AGENT_ID>
```

---

## RESUMEN: FLUJO AUTOMÁTICO

```python
# Pseudocódigo del flujo completo

def run_automated_agent_workflow(agentId, taskDescription):
    """
    Ciclo completo automático:
    1. Activar → 2. Asignar tarea → 3. Monitorear → 4. Desactivar
    """
    
    try:
        # 1. ACTIVATE
        print("🟢 Activating...")
        client.activate_agent(agentId)
        sleep(1)
        
        # 2. ASSIGN TASK
        print("📋 Assigning task...")
        task = client.assign_task(agentId, taskDescription, priority='high')
        
        # 3. MONITOR
        print("⏳ Monitoring...")
        while True:
            agent = client.get_agent(agentId)
            if agent['status'] in ['completed', 'error']:
                break
            sleep(2)
        
        # 4. DEACTIVATE
        print("⛔ Deactivating...")
        client.deactivate_agent(agentId)
        
        print("✅ Complete!")
        return True
        
    except Exception as e:
        # ALWAYS deactivate on error
        try:
            client.deactivate_agent(agentId)
        except:
            pass
        print(f"❌ Error: {e}")
        return False
```

---

## SOPORTE

| Problema | Contacto |
|----------|----------|
| API Issues | tech-support@amrosai.dev |
| Integration Help | anderson.martinez@amrosai.dev |
| API Key Request | admin@amrosai.dev |
| General Questions | docs.amrosai.dev |

---

**Última actualización**: 24 de Febrero de 2026  
**Versión**: 1.0.0  
**Estado**: ✅ Production Ready