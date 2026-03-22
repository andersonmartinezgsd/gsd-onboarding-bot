<!-- Dashboard Home -->
<div class="dashboard-grid">
    <!-- Stat Cards -->
    <div class="stats-row" id="stats-row">
        <div class="stat-card">
            <div class="stat-icon stat-icon-primary">
                <i class="fas fa-robot" aria-hidden="true"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value" id="stat-agents" aria-label="Agentes activos: cargando">—</span>
                <span class="stat-label">Agentes Activos</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon stat-icon-secondary">
                <i class="fas fa-folder-open" aria-hidden="true"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value" id="stat-projects" aria-label="Proyectos: cargando">—</span>
                <span class="stat-label">Proyectos</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon stat-icon-success">
                <i class="fas fa-comments" aria-hidden="true"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value" id="stat-conversations" aria-label="Conversaciones AI: cargando">—</span>
                <span class="stat-label">Conversaciones AI</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon stat-icon-accent">
                <i class="fas fa-file-alt" aria-hidden="true"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value" id="stat-documents" aria-label="Documentos: cargando">—</span>
                <span class="stat-label">Documentos</span>
            </div>
        </div>
    </div>

    <!-- AI Providers Status -->
    <div class="card" id="providers-card">
        <div class="card-header">
            <h3><i class="fas fa-server"></i> Proveedores AI</h3>
            <button class="btn btn-sm btn-ghost" onclick="checkProviders()">
                <i class="fas fa-sync-alt"></i> Verificar
            </button>
        </div>
        <div class="card-body">
            <div class="providers-grid" id="providers-grid">
                <div class="provider-card">
                    <div class="provider-icon">🦙</div>
                    <div class="provider-info">
                        <span class="provider-name">Ollama Local</span>
                        <span class="provider-status checking" id="provider-ollama">Verificando...</span>
                    </div>
                </div>
                <div class="provider-card">
                    <div class="provider-icon">🤖</div>
                    <div class="provider-info">
                        <span class="provider-name">OpenAI</span>
                        <span class="provider-status" id="provider-openai">No configurado</span>
                    </div>
                </div>
                <div class="provider-card">
                    <div class="provider-icon">🧠</div>
                    <div class="provider-info">
                        <span class="provider-name">Anthropic</span>
                        <span class="provider-status" id="provider-anthropic">No configurado</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
        <div class="card-header">
            <h3><i class="fas fa-bolt"></i> Acciones Rápidas</h3>
        </div>
        <div class="card-body">
            <div class="quick-actions">
                <a href="/ai-hub" class="quick-action-btn">
                    <i class="fas fa-comment-dots"></i>
                    <span>Chat con AI</span>
                </a>
                <a href="/projects" class="quick-action-btn">
                    <i class="fas fa-search"></i>
                    <span>Escanear Proyecto</span>
                </a>
                <a href="/brands" class="quick-action-btn">
                    <i class="fas fa-palette"></i>
                    <span>Nueva Marca</span>
                </a>
                <a href="/documents" class="quick-action-btn">
                    <i class="fas fa-upload"></i>
                    <span>Subir Documento</span>
                </a>
                <a href="/agents" class="quick-action-btn">
                    <i class="fas fa-user-plus"></i>
                    <span>Crear Agente</span>
                </a>
            </div>
        </div>
    </div>

    <!-- Recent Activity -->
    <div class="card">
        <div class="card-header">
            <h3><i class="fas fa-clock"></i> Actividad Reciente</h3>
        </div>
        <div class="card-body">
            <div id="recent-activity" class="activity-list">
                <p class="text-muted">Cargando actividad...</p>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar estadísticas
    try {
        const data = await AMR.api.get('/api/v1/dashboard/stats');
        if (data.stats) {
            document.getElementById('stat-agents').textContent = data.stats.active_agents;
            document.getElementById('stat-projects').textContent = data.stats.total_projects;
            document.getElementById('stat-conversations').textContent = data.stats.total_conversations;
            document.getElementById('stat-documents').textContent = data.stats.total_documents;
        }

        // Actividad reciente
        const activityEl = document.getElementById('recent-activity');
        if (data.recent_chats && data.recent_chats.length > 0) {
            // Escapar datos de la API antes de insertar en el DOM
            const escHtml = (str) => {
                const d = document.createElement('div');
                d.textContent = String(str ?? '');
                return d.innerHTML;
            };
            activityEl.innerHTML = data.recent_chats.map(chat => `
                <div class="activity-item">
                    <i class="fas fa-comment activity-icon" aria-hidden="true"></i>
                    <div class="activity-info">
                        <span class="activity-title">${escHtml(chat.title || 'Conversación')}</span>
                        <span class="activity-meta">${escHtml(chat.provider)} · ${escHtml(chat.model)}</span>
                    </div>
                    <span class="activity-time">${escHtml(new Date(chat.created_at).toLocaleDateString('es-CO'))}</span>
                </div>
            `).join('');
        } else {
            activityEl.innerHTML = '<p class="text-muted">Sin actividad reciente. ¡Inicia un chat con AI!</p>';
        }
    } catch (err) {
        console.error('Error cargando stats:', err);
        document.getElementById('recent-activity').innerHTML =
            '<p class="text-muted">No se pudo cargar la actividad reciente.</p>';
    }

    // Verificar proveedores
    checkProviders();
});

async function checkProviders() {
    try {
        const providers = await AMR.api.get('/api/v1/ai/providers');
        providers.forEach(p => {
            const el = document.getElementById(`provider-${p.provider}`);
            if (el) {
                const statusText = p.available
                    ? `Activo (${p.models.length} modelo${p.models.length !== 1 ? 's' : ''})`
                    : 'No disponible';
                el.textContent = statusText;
                el.className = `provider-status ${p.available ? 'active' : 'inactive'}`;
                el.setAttribute('aria-label', `${p.provider}: ${statusText}`);
            }
        });

        // Actualizar estado Ollama en sidebar
        const ollamaProvider = providers.find(p => p.provider === 'ollama');
        const dot = document.getElementById('ollama-status');
        if (dot) {
            dot.className = `status-dot ${ollamaProvider?.available ? 'online' : 'offline'}`;
        }
    } catch (err) {
        console.error('Error verificando proveedores:', err);
    }
}
</script>
