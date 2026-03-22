# GUÍA DE CONSUMO DE API AMROSAI DESDE APLICATIVOS EXTERNOS

## 🎯 Objetivo

Permitir que cualquier aplicación externa (VSCode, OpenCode, apps personalizadas) consuma la API de AMROSAI de forma segura y profesional.

---

## 🔒 Seguridad
- **Autenticación:** API Key (SHA-256)
- **Multi-tenant:** Cada cliente tiene su propio token
- **Permisos:** Los endpoints requieren scopes específicos

---

## 🚀 Pasos para Consumo

### 1. Obtener tu API Key
- Ingresa al Dashboard AMROSAI
- Ve a "API Config" → "Generar Token"
- Copia tu API Key

### 2. Configurar tu aplicación externa

#### **A. Desde VSCode (con fetch o axios)**
```js
const API_URL = 'http://localhost:42024/api/v1/agents';
const API_KEY = 'TU_API_KEY';

fetch(API_URL, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

#### **B. Desde OpenCode (Python requests)**
```python
import requests

API_URL = 'http://localhost:42024/api/v1/agents'
API_KEY = 'TU_API_KEY'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

response = requests.get(API_URL, headers=headers)
print(response.json())
```

#### **C. Desde cualquier app (cURL)**
```bash
curl -X GET "http://localhost:42024/api/v1/agents" \
     -H "Authorization: Bearer TU_API_KEY" \
     -H "Content-Type: application/json"
```

---

## 🛡️ Endpoints principales

- `/api/v1/agents` → Listar agentes
- `/api/v1/prompts` → Listar prompts
- `/api/v1/documentation` → Listar documentación
- `/api/v1/training` → Ejecutar training

---

## 🧩 Ejemplo de integración en VSCode Extension
```js
// En tu extension.js
const API_KEY = 'TU_API_KEY';
const fetchAgents = async () => {
  const res = await fetch('http://localhost:42024/api/v1/agents', {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  return await res.json();
};
```

---

## 📝 Recomendaciones
- Nunca expongas tu API Key en frontend público
- Usa HTTPS siempre
- Valida scopes y permisos antes de consumir endpoints
- Si usas OpenCode, puedes automatizar workflows con Python

---

## 🧪 Validación
- Prueba tu integración con Postman, cURL, VSCode REST Client
- Si recibes 401/403, revisa tu token y scopes
- Para endpoints protegidos, solicita permisos en el Dashboard

---

## 📞 Soporte
- Si tienes problemas, contacta a soporte AMROSAI
- Consulta la documentación en `/docs/documentation/`

---

**Última actualización:** 24/02/2026
