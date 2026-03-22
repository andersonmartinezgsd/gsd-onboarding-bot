# GSD VSCode Integration Guide

## 🚀 Connecting Your VSCode Project to GSD Agents

This guide shows how to integrate your VSCode project with the 87 GSD agents for AI-powered development assistance.

---

## 📋 Prerequisites

1. **GSD Server Running**: `http://localhost:41014`
2. **Python Project**: Your existing VSCode project
3. **Dependencies**: `requests`, `python-dotenv`

---

## 🔧 Step 1: Installation

Install the required dependencies in your VSCode project:

```bash
pip install requests python-dotenv
```

---

## 🛠️ Step 2: Create Configuration

Create a `.env` file in your project root:

```bash
# GSD Configuration
GSD_BASE_URL=http://localhost:41014
GSD_USER_EMAIL=your-email@example.com
GSD_USERNAME=your-username
GSD_FULL_NAME="Your Full Name"
VS_CODE_WORKSPACE=$(basename "$PWD")
```

---

## 📁 Step 3: Create GSD Client

Create `GSD_client.py` in your project:

```python
"""
GSD Agent Client for VSCode Integration
"""

import os
import requests
import json
from dotenv import load_dotenv
from typing import Dict, List, Optional

class GSDClient:
    def __init__(self):
        load_dotenv()
        self.base_url = os.getenv('GSD_BASE_URL', 'http://localhost:41014')
        self.session_token = None
        self.user_info = None
        
    def register_or_login(self) -> Dict[str, any]:
        """Register user or login to get session token"""
        login_data = {
            "username": os.getenv('GSD_USERNAME'),
            "vscode_workspace": os.getenv('VS_CODE_WORKSPACE', os.getcwd().split('/')[-1])
        }
        
        try:
            # Try to login
            response = requests.post(f"{self.base_url}/api/vscode/login", json=login_data)
        except:
            # If login fails, register
            register_data = {
                "username": os.getenv('GSD_USERNAME'),
                "email": os.getenv('GSD_USER_EMAIL'),
                "full_name": os.getenv('GSD_FULL_NAME'),
                "role": "developer",
                "vscode_workspace": os.getenv('VS_CODE_WORKSPACE')
            }
            response = requests.post(f"{self.base_url}/api/vscode/register", json=register_data)
        
        if response.status_code == 200:
            data = response.json()
            self.session_token = data['session_token']
            self.user_info = data
            print(f"✅ Connected to GSD as {data.get('workspace', 'Unknown workspace')}")
            return data
        else:
            raise Exception(f"Failed to connect: {response.text}")
    
    def get_available_agents(self) -> List[Dict]:
        """Get list of available agents"""
        if not self.session_token:
            self.register_or_login()
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        response = requests.get(f"{self.base_url}/api/vscode/agents", headers=headers)
        
        if response.status_code == 200:
            return response.json()['agents']
        else:
            raise Exception(f"Failed to get agents: {response.text}")
    
    def use_agent(self, agent_id: str, task_description: str, priority: str = "medium") -> Dict:
        """Assign a task to an agent"""
        if not self.session_token:
            self.register_or_login()
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        task_data = {
            "agent_id": agent_id,
            "task_description": task_description,
            "priority": priority
        }
        
        response = requests.post(
            f"{self.base_url}/api/vscode/agents/{agent_id}/use",
            json=task_data,
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to assign task: {response.text}")
    
    def complete_task(self, usage_id: str, result: str = "Task completed") -> Dict:
        """Mark a task as completed"""
        if not self.session_token:
            self.register_or_login()
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        response = requests.post(
            f"{self.base_url}/api/vscode/tasks/{usage_id}/complete",
            json={"result": result},
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to complete task: {response.text}")
    
    def get_my_tasks(self) -> List[Dict]:
        """Get current user's tasks"""
        if not self.session_token:
            self.register_or_login()
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        response = requests.get(f"{self.base_url}/api/vscode/my-tasks", headers=headers)
        
        if response.status_code == 200:
            return response.json()['tasks']
        else:
            raise Exception(f"Failed to get tasks: {response.text}")
    
    def get_dashboard_info(self) -> Dict:
        """Get dashboard information"""
        if not self.session_token:
            self.register_or_login()
        
        headers = {"Authorization": f"Bearer {self.session_token}"}
        response = requests.get(f"{self.base_url}/api/vscode/dashboard-data", headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to get dashboard data: {response.text}")

# Global client instance
GSD = GSDClient()
```

---

## 🎯 Step 4: Create Development Scripts

### `code_assistant.py` - AI Code Assistant

```python
#!/usr/bin/env python3
"""
AI Code Assistant using GSD Agents
"""

from GSD_client import GSD
import sys
import os

def setup_development_team():
    """Setup a standard development team"""
    print("🚀 Setting up development team...")
    
    # Common developer agents
    developer_agents = [
        ("SR-BACKEND-001", "Senior Backend Engineer"),
        ("SR-FRONTEND-001", "Senior Frontend Engineer"),
        ("SR-FULLSTACK-001", "Senior Full Stack Engineer"),
        ("SR-DEVOPS-001", "Senior DevOps Engineer"),
        ("SR-SEC-001", "Senior Security Engineer"),
        ("SR-UI-001", "Senior UI/UX Designer")
    ]
    
    available_agents = GSD.get_available_agents()
    available_ids = [a['id'] for a in available_agents]
    
    team = []
    for agent_id, role in developer_agents:
        if agent_id in available_ids:
            team.append((agent_id, role))
            print(f"✅ {role} ({agent_id}) - Available")
        else:
            print(f"❌ {role} ({agent_id}) - Not available")
    
    return team

def assign_development_task(agent_id: str, task: str):
    """Assign a development task"""
    try:
        result = GSD.use_agent(agent_id, task, "high")
        print(f"🎯 Task assigned to {result['agent']['name']}")
        print(f"📋 Task: {task}")
        print(f"🆔 Usage ID: {result['usage_id']}")
        print(f"⏰ Assigned at: {result['task']['assigned_at']}")
        return result['usage_id']
    except Exception as e:
        print(f"❌ Failed to assign task: {e}")
        return None

def get_project_context():
    """Get current project context"""
    current_dir = os.getcwd()
    project_name = os.path.basename(current_dir)
    
    # Try to detect project type
    if os.path.exists('package.json'):
        project_type = "Node.js"
    elif os.path.exists('requirements.txt') or os.path.exists('pyproject.toml'):
        project_type = "Python"
    elif os.path.exists('pom.xml') or os.path.exists('build.gradle'):
        project_type = "Java"
    elif os.path.exists('Cargo.toml'):
        project_type = "Rust"
    else:
        project_type = "Unknown"
    
    return f"{project_name} ({project_type})"

def main():
    if len(sys.argv) < 2:
        print("Usage: python code_assistant.py <command> [args]")
        print("Commands:")
        print("  setup                 Setup development team")
        print("  assign <agent_id> <task>  Assign task to agent")
        print("  tasks                 Show my tasks")
        print("  dashboard             Show dashboard")
        print("  project-analyze       Analyze current project")
        return
    
    command = sys.argv[1]
    
    if command == "setup":
        setup_development_team()
    
    elif command == "assign" and len(sys.argv) >= 4:
        agent_id = sys.argv[2]
        task = " ".join(sys.argv[3:])
        project_context = get_project_context()
        full_task = f"[{project_context}] {task}"
        assign_development_task(agent_id, full_task)
    
    elif command == "tasks":
        tasks = GSD.get_my_tasks()
        print(f"📋 Your active tasks ({len(tasks)}):")
        for task in tasks:
            status = "🟢" if task['status'] == 'completed' else "🔄"
            print(f"{status} {task['agent_name']} - {task['task_description'][:50]}...")
    
    elif command == "dashboard":
        dashboard = GSD.get_dashboard_info()
        print(f"📊 GSD Dashboard:")
        print(f"   Active Users: {dashboard['active_users']}")
        print(f"   Current Tasks: {dashboard['current_tasks']}")
        print(f"   Completed Today: {dashboard['completed_today']}")
        print(f"   Total Agents: {dashboard['total_agents']}")
    
    elif command == "project-analyze":
        project = get_project_context()
        print(f"🔍 Analyzing project: {project}")
        
        # Assign analysis tasks
        backend_usage = assign_development_task(
            "SR-BACKEND-001",
            f"Analyze {project} backend architecture and suggest improvements"
        )
        
        frontend_usage = assign_development_task(
            "SR-FRONTEND-001", 
            f"Analyze {project} frontend code and suggest optimizations"
        )
        
        security_usage = assign_development_task(
            "SR-SEC-001",
            f"Perform security analysis of {project} and identify vulnerabilities"
        )
        
        print("\n🎯 Analysis tasks assigned. Check 'code_assistant.py tasks' to see results.")
    
    else:
        print("❌ Unknown command or missing arguments")

if __name__ == "__main__":
    main()
```

---

## 🔧 Step 5: VSCode Task Configuration

Add to your `.vscode/tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "GSD: Setup Development Team",
            "type": "shell",
            "command": "python",
            "args": ["code_assistant.py", "setup"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "GSD: Analyze Project",
            "type": "shell",
            "command": "python",
            "args": ["code_assistant.py", "project-analyze"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "GSD: Show My Tasks",
            "type": "shell",
            "command": "python",
            "args": ["code_assistant.py", "tasks"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        }
    ]
}
```

---

## 🚀 Step 6: Usage Examples

### Example 1: Setting Up Development Team

```bash
# Connect to GSD and setup team
python code_assistant.py setup
```

### Example 2: Analyzing Your Project

```bash
# Get comprehensive project analysis
python code_assistant.py project-analyze
```

### Example 3: Assign Specific Tasks

```bash
# Backend development task
python code_assistant.py assign SR-BACKEND-001 "Implement user authentication API with JWT"

# Frontend development task  
python code_assistant.py assign SR-FRONTEND-001 "Create responsive dashboard with real-time data"

# Code review task
python code_assistant.py assign SR-SEC-001 "Review authentication code for security vulnerabilities"
```

### Example 4: Checking Your Tasks

```bash
# See all your assigned tasks
python code_assistant.py tasks
```

---

## 📱 Step 7: Real-time Dashboard Integration

Create `dashboard_monitor.py`:

```python
"""
Real-time Dashboard Monitor for GSD
"""

from GSD_client import GSD
import time
import os
from datetime import datetime

def clear_screen():
    """Clear terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def show_dashboard():
    """Show real-time dashboard"""
    while True:
        clear_screen()
        
        try:
            dashboard = GSD.get_dashboard_info()
            my_tasks = GSD.get_my_tasks()
            
            print("🚀 GSD Agent Dashboard")
            print("=" * 50)
            print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print()
            
            print("📊 System Overview:")
            print(f"   Active Users: {dashboard['active_users']}")
            print(f"   Current Tasks: {dashboard['current_tasks']}")
            print(f"   Completed Today: {dashboard['completed_today']}")
            print(f"   Total Agents: {dashboard['total_agents']}")
            print()
            
            # Agent status
            if 'agent_status' in dashboard:
                print("🤖 Agent Status:")
                for status, count in dashboard['agent_status'].items():
                    emoji = "🟢" if status == "active" else "🔄" if status == "busy" else "⚪"
                    print(f"   {emoji} {status.capitalize()}: {count}")
                print()
            
            # My active tasks
            active_tasks = [t for t in my_tasks if t['status'] == 'in_progress']
            if active_tasks:
                print("🎯 Your Active Tasks:")
                for task in active_tasks[:5]:  # Show top 5
                    print(f"   📋 {task['agent_name']}: {task['task_description'][:60]}...")
                print()
            
            # Top agents
            if dashboard.get('top_agents'):
                print("⭐ Most Used Agents:")
                for agent in dashboard['top_agents'][:5]:
                    print(f"   🏆 {agent['name']}: {agent['usage_count']} uses")
            
            print("\n" + "=" * 50)
            print("Press Ctrl+C to exit")
            
        except Exception as e:
            print(f"❌ Error: {e}")
        
        time.sleep(10)  # Update every 10 seconds

if __name__ == "__main__":
    show_dashboard()
```

---

## 🎯 Step 8: Advanced Integration with OpenCode

When using OpenCode, you can leverage the agents like this:

```python
"""
OpenCode Integration with GSD Agents
"""

from GSD_client import GSD

# OpenCode can use this function to get agent assistance
def get_agent_help(task_type: str, description: str):
    """Get help from GSD agents for OpenCode tasks"""
    
    agent_mapping = {
        "backend": "SR-BACKEND-001",
        "frontend": "SR-FRONTEND-001", 
        "fullstack": "SR-FULLSTACK-001",
        "devops": "SR-DEVOPS-001",
        "security": "SR-SEC-001",
        "database": "SR-DATABASE-001",
        "testing": "SR-QA-001"
    }
    
    agent_id = agent_mapping.get(task_type.lower(), "SR-FULLSTACK-001")
    
    try:
        result = GSD.use_agent(
            agent_id=agent_id,
            task_description=f"[OpenCode Task] {description}",
            priority="high"
        )
        
        return {
            "success": True,
            "agent": result['agent'],
            "usage_id": result['usage_id'],
            "message": f"Task assigned to {result['agent']['name']}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# Example usage:
# result = get_agent_help("backend", "Create RESTful API for user management")
# print(result)
```

---

## 🔍 Step 9: Monitoring in GSD Dashboard

After connecting your VSCode project:

1. **Open GSD Dashboard**: `http://localhost:41014/dashboard`
2. **View Active Users**: See who is connected and using agents
3. **Monitor Task Assignments**: Track real-time agent usage
4. **Check Performance**: See which agents are most utilized

The dashboard now shows:
- ✅ Connected users and their workspaces
- ✅ Real-time task assignments
- ✅ Agent utilization metrics
- ✅ User activity tracking

---

## 🚀 Quick Start Example

```bash
# 1. Start your GSD server (if not running)
python simple_demo.py

# 2. In your VSCode project directory:
python code_assistant.py setup
python code_assistant.py project-analyze

# 3. Check your tasks:
python code_assistant.py tasks

# 4. Monitor dashboard:
python dashboard_monitor.py
```

Your VSCode project is now connected to the 87 GSD agents! You can see all activity in real-time on the dashboard at `http://localhost:41014/dashboard`.

---

**🎉 You're now ready to use AI agents in your VSCode development workflow!**