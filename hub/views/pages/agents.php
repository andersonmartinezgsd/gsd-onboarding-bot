<!-- Gestor de Agentes AI -->
<div class="page-header">
    <div>
        <h2>Gestor de Agentes AI</h2>
        <p class="text-muted">20 agentes especializados: desarrollo, marketing, automatización</p>
    </div>
    <button class="btn btn-primary" onclick="showCreateAgent()">
        <i class="fas fa-plus"></i> Crear Agente
    </button>
</div>

<!-- Filtros por categoría -->
<div class="category-tabs">
    <button class="tab-btn active" onclick="filterAgents('', this)">Todos</button>
    <button class="tab-btn" onclick="filterAgents('framework', this)">🏗️ Framework</button>
    <button class="tab-btn" onclick="filterAgents('marketing', this)">📈 Marketing</button>
    <button class="tab-btn" onclick="filterAgents('automation', this)">🤖 Automatización</button>
    <button class="tab-btn" onclick="filterAgents('analytics', this)">📊 Analytics</button>
    <button class="tab-btn" onclick="filterAgents('sales', this)">💼 Ventas</button>
</div>

<!-- Grid de Agentes -->
<div class="agents-grid" id="agents-grid">
    <div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Cargando agentes...</div>
</div>

<!-- Modal: Crear Agente -->
<div class="modal-overlay" id="create-modal" style="display:none"
     role="dialog" aria-modal="true" aria-labelledby="modal-title-create">
    <div class="modal">
        <div class="modal-header">
            <h3 id="modal-title-create">Crear Nuevo Agente</h3>
            <button class="modal-close" onclick="closeModal()" aria-label="Cerrar modal">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label for="new-agent-id">ID del agente</label>
                <input type="text" id="new-agent-id" class="form-input" placeholder="mi-agente-custom"
                       aria-describedby="agent-id-hint">
                <span id="agent-id-hint" class="text-muted text-sm" style="display:block;margin-top:4px">
                    Solo minúsculas, guiones. Ej: mi-agente-custom
                </span>
            </div>
            <div class="form-group">
                <label for="new-agent-name">Nombre</label>
                <input type="text" id="new-agent-name" class="form-input" placeholder="Mi Agente Custom">
            </div>
            <div class="form-group">
                <label for="new-agent-category">Categoría</label>
                <select id="new-agent-category" class="form-select">
                    <option value="framework">🏗️ Framework</option>
                    <option value="marketing">📈 Marketing</option>
                    <option value="automation">🤖 Automatización</option>
                    <option value="analytics">📊 Analytics</option>
                    <option value="sales">💼 Ventas</option>
                    <option value="custom">⚡ Custom</option>
                </select>
            </div>
            <div class="form-group">
                <label for="new-agent-icon">Icono (emoji)</label>
                <input type="text" id="new-agent-icon" class="form-input" placeholder="🤖" value="🤖">
            </div>
            <div class="form-group">
                <label for="new-agent-desc">Descripción</label>
                <textarea id="new-agent-desc" class="form-textarea" rows="3" placeholder="Descripción del agente..."></textarea>
            </div>
            <div class="form-group">
                <label for="new-agent-prompt">System Prompt</label>
                <textarea id="new-agent-prompt" class="form-textarea" rows="5" placeholder="Instrucciones del agente..."></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="createAgent()">Crear Agente</button>
        </div>
    </div>
</div>

<script>
let allAgents = [];

document.addEventListener('DOMContentLoaded', loadAgents);

async function loadAgents() {
    try {
        const data = await AMR.api.get('/api/v1/agents');
        allAgents = data.agents || [];
        renderAgents(allAgents);
    } catch (err) {
        const p = document.createElement('p');
        p.className = 'text-error';
        p.textContent = 'Error cargando agentes: ' + (err.message || 'Error desconocido');
        const grid = document.getElementById('agents-grid');
        grid.innerHTML = '';
        grid.appendChild(p);
    }
}

// Función de escape centralizada para texto plano en HTML
function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
}

function renderAgents(agents) {
    const grid = document.getElementById('agents-grid');
    if (agents.length === 0) {
        grid.innerHTML = '<p class="text-muted text-center">No hay agentes en esta categoría</p>';
        return;
    }

    // SEGURIDAD: todos los datos de la API se escapan antes de insertarse en innerHTML
    grid.innerHTML = agents.map(a => `
        <div class="agent-card ${a.status === 'active' ? '' : 'agent-inactive'}">
            <div class="agent-header">
                <span class="agent-icon">${esc(a.icon || '🤖')}</span>
                <span class="agent-status-badge ${esc(a.status)}">${a.status === 'active' ? '🟢' : '🔴'}</span>
            </div>
            <h4 class="agent-name">${esc(a.name)}</h4>
            <span class="agent-category">${esc(a.category)}</span>
            <p class="agent-desc">${esc(a.description || 'Sin descripción')}</p>
            <div class="agent-stats">
                <span title="Tareas completadas"><i class="fas fa-check"></i> ${esc(a.tasks_completed)}</span>
                <span title="Experiencia"><i class="fas fa-star"></i> ${esc(a.xp)} XP</span>
                <span title="Nivel" class="agent-level">${esc(a.level)}</span>
            </div>
            <div class="agent-actions">
                <button class="btn btn-sm btn-ghost"
                        data-agent-id="${esc(a.agent_id)}"
                        data-agent-name="${esc(a.name)}"
                        onclick="chatWithAgent(this.dataset.agentId, this.dataset.agentName)">
                    <i class="fas fa-comment"></i> Chat
                </button>
                <button class="btn btn-sm btn-ghost"
                        data-agent-db-id="${esc(a.id)}"
                        onclick="assignTask(this.dataset.agentDbId)">
                    <i class="fas fa-tasks"></i> Tarea
                </button>
            </div>
        </div>
    `).join('');
}

function filterAgents(category, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const filtered = category ? allAgents.filter(a => a.category === category) : allAgents;
    renderAgents(filtered);
}

function chatWithAgent(agentId, agentName) {
    window.location.href = `/ai-hub?agent=${agentId}`;
}

// Variable global para limpiar la trampa de foco al cerrar
let _modalFocusCleanup = null;

function showCreateAgent() {
    const modal = document.getElementById('create-modal');
    modal.style.display = 'flex';

    requestAnimationFrame(() => {
        // Mover foco al primer campo del modal
        const firstInput = modal.querySelector('input, select, textarea, button');
        if (firstInput) firstInput.focus();

        // Activar trampa de foco para ciclar Tab dentro del modal
        if (window.AMR?.a11y?.trapFocus) {
            _modalFocusCleanup = window.AMR.a11y.trapFocus(modal);
        }
    });
}

function closeModal() {
    // Liberar trampa de foco
    if (_modalFocusCleanup) {
        _modalFocusCleanup();
        _modalFocusCleanup = null;
    }

    document.getElementById('create-modal').style.display = 'none';

    // Devolver foco al botón que abrió el modal
    const openBtn = document.querySelector('[onclick="showCreateAgent()"]');
    if (openBtn) openBtn.focus();
}

// Cerrar modal con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('create-modal');
        if (modal && modal.style.display !== 'none') closeModal();
    }
});

// Cerrar modal al hacer click fuera
document.getElementById('create-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

async function createAgent() {
    const agent = {
        agent_id: document.getElementById('new-agent-id').value.trim(),
        name: document.getElementById('new-agent-name').value.trim(),
        category: document.getElementById('new-agent-category').value,
        icon: document.getElementById('new-agent-icon').value.trim() || '🤖',
        description: document.getElementById('new-agent-desc').value.trim(),
        system_prompt: document.getElementById('new-agent-prompt').value.trim(),
    };

    if (!agent.agent_id || !agent.name) {
        AMR.toast.error('ID y nombre son requeridos');
        return;
    }

    try {
        await AMR.api.post('/api/v1/agents', agent);
        AMR.toast.success(`Agente "${agent.name}" creado`);
        closeModal();
        loadAgents();
    } catch (err) {
        AMR.toast.error('Error creando agente: ' + err.message);
    }
}

// assignTask — stub hasta que el endpoint /api/v1/agents/{id}/tasks esté implementado
function assignTask(agentDbId) {
    AMR.toast.info(`Asignación de tareas próximamente (agente #${agentDbId})`);
}
</script>
