# GSD MVP - Postman Collection Examples

## 🚀 API Base Configuration

**Base URL**: `http://localhost:41014`
**API Version**: `v1`
**Content-Type**: `application/json`

---

## 📋 API Endpoints Examples

### 1. **Health Check**
```bash
# Verify API is running
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-12T15:30:00.000Z",
  "version": "1.0.0",
  "database": "connected"
}
```

---

### 2. **Get All 87 Agents**
```bash
# List all agents in the system
GET /api/v1/agents
```

**Response Sample (First 3 agents):**
```json
[
  {
    "id": "CEO-001",
    "name": "Chief Executive Officer",
    "role": "Chief Executive Officer",
    "department": "Executive",
    "status": "busy",
    "capabilities": [
      {"name": "Strategic Planning", "level": "expert"},
      {"name": "Leadership", "level": "expert"}
    ],
    "monthly_cost": 43750.0,
    "tasks_completed": 0,
    "success_rate": 85.9,
    "organization_id": 1
  },
  {
    "id": "CTO-001",
    "name": "Chief Technology Officer",
    "role": "Chief Technology Officer",
    "department": "Executive",
    "status": "inactive",
    "capabilities": [
      {"name": "Technology Strategy", "level": "expert"},
      {"name": "Enterprise Architecture", "level": "expert"}
    ],
    "monthly_cost": 37500.0,
    "tasks_completed": 0,
    "success_rate": 94.2,
    "organization_id": 1
  }
]
```

---

### 3. **Get Specific Agent**
```bash
# Get agent by ID
GET /api/v1/agents/CTO-001
```

**Response:**
```json
{
  "id": "CTO-001",
  "name": "Chief Technology Officer",
  "role": "Chief Technology Officer",
  "department": "Executive",
  "status": "inactive",
  "capabilities": [
    {"name": "Technology Strategy", "level": "expert"},
    {"name": "Enterprise Architecture", "level": "expert"},
    {"name": "Innovation Management", "level": "expert"},
    {"name": "Team Leadership", "level": "expert"}
  ],
  "monthly_cost": 37500.0,
  "tasks_completed": 0,
  "success_rate": 94.2,
  "organization_id": 1
}
```

---

### 4. **Activate Agent**
```bash
# Activate an agent to make them available for tasks
POST /api/v1/agents/CTO-001/activate
```

**Response:**
```json
{
  "id": "CTO-001",
  "name": "Chief Technology Officer",
  "role": "Chief Technology Officer",
  "department": "Executive",
  "status": "active",
  "capabilities": [
    {"name": "Technology Strategy", "level": "expert"},
    {"name": "Enterprise Architecture", "level": "expert"}
  ],
  "monthly_cost": 37500.0,
  "tasks_completed": 0,
  "success_rate": 98.0,
  "organization_id": 1
}
```

---

### 5. **Deactivate Agent**
```bash
# Deactivate an agent
POST /api/v1/agents/CTO-001/deactivate
```

**Response:**
```json
{
  "id": "CTO-001",
  "name": "Chief Technology Officer",
  "role": "Chief Technology Officer",
  "department": "Executive",
  "status": "inactive",
  "capabilities": [...],
  "monthly_cost": 37500.0,
  "tasks_completed": 0,
  "success_rate": 98.0,
  "organization_id": 1
}
```

---

### 6. **Assign Task to Agent** ⭐ NEW
```bash
# Assign a task to an active agent
POST /api/v1/agents/SR-BACKEND-001/assign-task
Content-Type: application/json

{
  "agent_id": "SR-BACKEND-001",
  "task_description": "Develop REST API for user management with authentication",
  "priority": "high",
  "estimated_hours": 16.0
}
```

**Response:**
```json
{
  "message": "Task assigned successfully to agent SR-BACKEND-001",
  "task_id": "task_1644678900.123",
  "agent_status": "busy",
  "task": {
    "id": "task_1644678900.123",
    "description": "Develop REST API for user management with authentication",
    "priority": "high",
    "estimated_hours": 16.0,
    "status": "assigned",
    "assigned_at": "2026-02-12T15:30:00.000Z",
    "agent_id": "SR-BACKEND-001"
  }
}
```

---

### 7. **Get Organization Metrics**
```bash
# Get system-wide metrics
GET /api/v1/agents/metrics
```

**Response:**
```json
{
  "total_agents": 87,
  "active_agents": 24,
  "busy_agents": 13,
  "inactive_agents": 50,
  "total_tasks_completed": 370,
  "monthly_cost": 1525833.33,
  "annual_cost": 18310000.0,
  "average_success_rate": 96.8,
  "calculated_at": "2026-02-12T15:30:00.000Z",
  "database_status": "connected",
  "agents_source": "real_database_87_agents"
}
```

---

## 🔍 Advanced Usage Examples

### **Find Developer Agents**
```bash
# Get all agents and filter for developers
GET /api/v1/agents

# Filter response for agents with "Backend" or "Frontend" in role
# Look for department "Engineering"
```

**Sample Developer Agents:**
- `SR-BACKEND-001` - Senior Backend Engineer ($18,750/month)
- `SR-FRONTEND-001` - Senior Frontend Engineer ($16,250/month)
- `SR-FULLSTACK-001` - Senior Full Stack Engineer ($18,333/month)
- `MID-BACKEND-001` - Backend Engineer ($11,667/month)

---

### **Activate Multiple Developers**
```bash
# Activate senior developers for a project
POST /api/v1/agents/SR-BACKEND-001/activate
POST /api/v1/agents/SR-FRONTEND-001/activate
POST /api/v1/agents/SR-FULLSTACK-001/activate

# Then assign tasks
POST /api/v1/agents/SR-BACKEND-001/assign-task
{
  "task_description": "Design and implement user authentication microservice",
  "priority": "high",
  "estimated_hours": 24.0
}

POST /api/v1/agents/SR-FRONTEND-001/assign-task
{
  "task_description": "Create responsive login and registration forms",
  "priority": "high",
  "estimated_hours": 16.0
}
```

---

## 📊 Postman Collection Setup

### **Environment Variables**
```json
{
  "base_url": "http://localhost:41014",
  "api_version": "v1",
  "cto_id": "CTO-001",
  "senior_backend_id": "SR-BACKEND-001",
  "senior_frontend_id": "SR-FRONTEND-001"
}
```

### **Collection Structure**
```
GSD MVP/
├── 🏥 Health & Status
│   ├── Health Check
│   └── System Info
├── 👥 Agent Management
│   ├── List All Agents
│   ├── Get Specific Agent
│   ├── Activate Agent
│   ├── Deactivate Agent
│   └── Assign Task to Agent
├── 📈 Metrics & Analytics
│   ├── Organization Metrics
│   └── Agent Performance
└── 🎯 Task Management
    ├── Assign Development Task
    ├── Assign Design Task
    └── Assign Security Task
```

---

## 🛠️ cURL Examples

### **Quick Test Commands**
```bash
# Test API is running
curl -X GET http://localhost:41014/health

# List all agents (first 3)
curl -X GET http://localhost:41014/api/v1/agents | jq '.[0:3]'

# Get CTO details
curl -X GET http://localhost:41014/api/v1/agents/CTO-001 | jq

# Activate CTO
curl -X POST http://localhost:41014/api/v1/agents/CTO-001/activate

# Assign task to senior backend developer
curl -X POST http://localhost:41014/api/v1/agents/SR-BACKEND-001/assign-task \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "SR-BACKEND-001",
    "task_description": "Implement user authentication API",
    "priority": "high",
    "estimated_hours": 12.0
  }'

# Get system metrics
curl -X GET http://localhost:41014/api/v1/agents/metrics | jq
```

---

## 🎮 Real-World Scenarios

### **Scenario 1: Set Up Development Team**
```bash
# 1. Activate development team
POST /api/v1/agents/SR-BACKEND-001/activate  # Tech Lead
POST /api/v1/agents/MID-BACKEND-001/activate  # Backend Dev
POST /api/v1/agents/SR-FRONTEND-001/activate  # Frontend Lead
POST /api/v1/agents/MID-FRONTEND-001/activate  # Frontend Dev
POST /api/v1/agents/SR-UI-001/activate         # UI/UX Designer

# 2. Assign sprint tasks
POST /api/v1/agents/SR-BACKEND-001/assign-task
{
  "task_description": "Design microservices architecture for new product",
  "priority": "high",
  "estimated_hours": 32.0
}

POST /api/v1/agents/MID-BACKEND-001/assign-task
{
  "task_description": "Implement user authentication service",
  "priority": "high", 
  "estimated_hours": 24.0
}
```

### **Scenario 2: Code Review Process**
```bash
# Activate security engineer for code review
POST /api/v1/agents/SR-SEC-001/activate

# Assign security review task
POST /api/v1/agents/SR-SEC-001/assign-task
{
  "task_description": "Security review of authentication implementation",
  "priority": "high",
  "estimated_hours": 8.0
}
```

### **Scenario 3: Performance Monitoring**
```bash
# Check team status
GET /api/v1/agents/metrics

# Monitor specific agents
GET /api/v1/agents/SR-BACKEND-001
GET /api/v1/agents/MID-FRONTEND-001
```

---

## 📱 Dashboard Access

**Interactive Dashboard**: `http://localhost:41014/dashboard`
- View all 87 agents in real-time
- Activate/deactivate agents with one click
- Monitor task assignments and agent status
- Real-time metrics and performance data

---

## 🔗 Integration Examples

### **JavaScript/Fetch API**
```javascript
// Get all agents
const response = await fetch('http://localhost:41014/api/v1/agents');
const agents = await response.json();

// Filter for active developers
const activeDevelopers = agents.filter(agent => 
  agent.status === 'active' && 
  agent.department === 'Engineering'
);

// Assign task to developer
const assignTask = async (agentId, taskDescription) => {
  const response = await fetch(`http://localhost:41014/api/v1/agents/${agentId}/assign-task`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: agentId,
      task_description: taskDescription,
      priority: 'medium',
      estimated_hours: 8.0
    })
  });
  return await response.json();
};
```

### **Python/Requests**
```python
import requests

base_url = "http://localhost:41014"

# Get all agents
response = requests.get(f"{base_url}/api/v1/agents")
agents = response.json()

# Activate an agent
requests.post(f"{base_url}/api/v1/agents/CTO-001/activate")

# Assign task
task_data = {
    "agent_id": "SR-BACKEND-001",
    "task_description": "Implement REST API endpoints",
    "priority": "high",
    "estimated_hours": 16.0
}
response = requests.post(f"{base_url}/api/v1/agents/SR-BACKEND-001/assign-task", json=task_data)
print(response.json())
```

---

**Last Updated**: 2026-02-12  
**Total Agents**: 87 Real AI Agents  
**API Version**: v1.0.0  
**Port**: 41014