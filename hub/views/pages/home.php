<!-- Dashboard Home -->
<div class="dashboard-grid">
    <!-- Stat Cards -->
    <div class="stats-row" id="stats-row">
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(0,212,255,0.15); color: var(--amr-primary);">
                <i class="fas fa-robot"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value" id="stat-agents">—</span>
                <span class="stat-label">Agentes Activos</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(124,58,237,0.15); color: var(--amr-secondary);">
                <i class="fas fa-folder-open"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value" id="stat-projects">—</span>
                <span class="stat-label">Proyectos</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(16,185,129,0.15); color: var(--amr-success);">
                <i class="fas fa-comments"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value" id="stat-conversations">—</span>
                <span class="stat-label">Conversaciones AI</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(245,158,11,0.15); color: var(--amr-accent);">
                <i class="fas fa-file-alt"></i>
            </div>
            <div class="stat-info">
                <span class="stat-value" id="stat-documents">—</span>
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
            activityEl.innerHTML = data.recent_chats.map(chat => `
                <div class="activity-item">
                    <i class="fas fa-comment activity-icon"></i>
                    <div class="activity-info">
                        <span class="activity-title">${chat.title || 'Conversación'}</span>
                        <span class="activity-meta">${chat.provider} · ${chat.model}</span>
                    </div>
                    <span class="activity-time">${new Date(chat.created_at).toLocaleDateString('es')}</span>
                </div>
            `).join('');
        } else {
            activityEl.innerHTML = '<p class="text-muted">Sin actividad reciente. ¡Inicia un chat con AI!</p>';
        }
    } catch (err) {
        console.error('Error cargando stats:', err);
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
                el.textContent = p.available ? `✅ Activo (${p.models.length} modelos)` : '❌ No disponible';
                el.className = `provider-status ${p.available ? 'active' : 'inactive'}`;
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
