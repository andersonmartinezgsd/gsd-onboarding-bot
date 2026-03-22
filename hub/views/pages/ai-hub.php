<!-- AI Hub — Chat con múltiples proveedores -->
<div class="ai-hub-layout">
    <!-- Panel izquierdo: Historial -->
    <div class="chat-sidebar">
        <button class="btn btn-primary btn-block" onclick="newConversation()">
            <i class="fas fa-plus"></i> Nueva Conversación
        </button>
        <div class="chat-history" id="chat-history">
            <p class="text-muted text-center">Sin conversaciones</p>
        </div>
    </div>

    <!-- Panel central: Chat -->
    <div class="chat-main">
        <!-- Selector de modelo -->
        <div class="model-selector">
            <div class="selector-group">
                <label>Proveedor:</label>
                <select id="ai-provider" onchange="loadModels()">
                    <option value="ollama">🦙 Ollama Local</option>
                    <option value="openai">🤖 OpenAI</option>
                    <option value="anthropic">🧠 Anthropic</option>
                </select>
            </div>
            <div class="selector-group">
                <label>Modelo:</label>
                <select id="ai-model">
                    <option value="">Cargando...</option>
                </select>
                <button class="btn btn-sm btn-ghost" onclick="refreshProviders()" title="Recargar modelos" style="padding:4px 6px">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
            <div class="selector-group">
                <label>Agente:</label>
                <select id="ai-agent">
                    <option value="">Sin agente</option>
                </select>
            </div>
        </div>

        <!-- Mensajes -->
        <div class="chat-messages" id="chat-messages">
            <div class="welcome-message">
                <div class="welcome-icon">⚡</div>
                <h2>AMR Hub AI</h2>
                <p>Conectado a múltiples proveedores AI. Selecciona un modelo y empieza a chatear.</p>
                <div class="welcome-suggestions">
                    <button class="suggestion-btn" onclick="sendSuggestion('Analiza el proyecto td-dashboard y genera un plan de refactoring')">
                        🔍 Analizar proyecto
                    </button>
                    <button class="suggestion-btn" onclick="sendSuggestion('Genera una paleta de colores profesional para una marca de tecnología')">
                        🎨 Generar paleta de colores
                    </button>
                    <button class="suggestion-btn" onclick="sendSuggestion('Crea un plan de marketing digital para un producto SaaS')">
                        📈 Plan de marketing
                    </button>
                    <button class="suggestion-btn" onclick="sendSuggestion('Diseña la arquitectura de una API REST siguiendo SOLID')">
                        🏗️ Arquitectura API
                    </button>
                </div>
            </div>
        </div>

        <!-- Input -->
        <div class="chat-input-area">
            <div class="input-wrapper">
                <textarea
                    id="chat-input"
                    placeholder="Escribe tu mensaje..."
                    rows="1"
                    onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();sendMessage()}"
                    oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,200)+'px'"
                ></textarea>
                <button class="send-btn" onclick="sendMessage()" id="send-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            <div class="input-footer">
                <span class="text-muted text-sm">Enter para enviar · Shift+Enter para nueva línea</span>
                <span class="text-muted text-sm" id="token-count"></span>
            </div>
        </div>
    </div>
</div>

<script>
let currentConversationId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadModels();
    loadAgents();
});

// Cache de proveedores para no llamar la API cada vez
let providersCache = null;

async function loadModels() {
    const provider = document.getElementById('ai-provider').value;
    const select = document.getElementById('ai-model');

    // Mostrar loading
    select.innerHTML = '<option value="">Cargando modelos...</option>';
    select.disabled = true;

    try {
        // Usar cache si existe, sino cargar
        if (!providersCache) {
            providersCache = await AMR.api.get('/api/v1/ai/providers');
        }

        const current = providersCache.find(p => p.provider === provider);

        if (!current) {
            select.innerHTML = '<option value="">Proveedor no encontrado</option>';
            select.disabled = false;
            return;
        }

        if (!current.available) {
            select.innerHTML = '<option value="">❌ Proveedor no disponible — configura la API key en Settings</option>';
            select.disabled = false;
            return;
        }

        if (current.models.length === 0) {
            select.innerHTML = '<option value="">Sin modelos disponibles</option>';
            select.disabled = false;
            return;
        }

        select.innerHTML = current.models.map(m =>
            `<option value="${m.id}">${m.name || m.id}</option>`
        ).join('');
        select.disabled = false;

    } catch (err) {
        console.error('Error cargando modelos:', err);
        select.innerHTML = '<option value="">Error cargando modelos</option>';
        select.disabled = false;
    }
}

// Forzar recarga de proveedores cuando se cambia el selector
function refreshProviders() {
    providersCache = null;
    loadModels();
}

async function loadAgents() {
    try {
        const data = await AMR.api.get('/api/v1/agents');
        const select = document.getElementById('ai-agent');
        select.innerHTML = '<option value="">Sin agente</option>';
        select.innerHTML += (data.agents || []).map(a =>
            `<option value="${a.agent_id}">${a.icon} ${a.name}</option>`
        ).join('');
    } catch (err) {
        console.error('Error cargando agentes:', err);
    }
}

function newConversation() {
    currentConversationId = null;
    document.getElementById('chat-messages').innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">⚡</div>
            <h2>Nueva Conversación</h2>
            <p>Listo para chatear.</p>
        </div>`;
}

function sendSuggestion(text) {
    document.getElementById('chat-input').value = text;
    sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const prompt = input.value.trim();
    if (!prompt) return;

    const provider = document.getElementById('ai-provider').value;
    const model = document.getElementById('ai-model').value;
    const agent = document.getElementById('ai-agent').value;

    // Limpiar welcome y mostrar mensaje del usuario
    const messagesEl = document.getElementById('chat-messages');
    const welcome = messagesEl.querySelector('.welcome-message');
    if (welcome) welcome.remove();

    messagesEl.innerHTML += `
        <div class="message message-user">
            <div class="message-avatar">👤</div>
            <div class="message-content">${escapeHtml(prompt)}</div>
        </div>`;

    // Mostrar "pensando..."
    messagesEl.innerHTML += `
        <div class="message message-assistant" id="thinking-msg">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="thinking-dots"><span></span><span></span><span></span></div>
            </div>
        </div>`;

    messagesEl.scrollTop = messagesEl.scrollHeight;
    input.value = '';
    input.style.height = 'auto';

    // Build system prompt from agent
    let systemPrompt = null;
    if (agent) {
        systemPrompt = `Eres el agente ${agent} de AMR Tech. Responde en español colombiano. Sigue las reglas del CLAUDE.md.`;
    }

    try {
        const data = await AMR.api.post('/api/v1/ai/chat', {
            prompt,
            model,
            provider,
            system_prompt: systemPrompt,
            conversation_id: currentConversationId,
        });

        currentConversationId = data.conversation_id;

        // Reemplazar "pensando" con respuesta
        const thinkingEl = document.getElementById('thinking-msg');
        if (thinkingEl) {
            thinkingEl.querySelector('.message-content').innerHTML = formatResponse(data.response.content);
            thinkingEl.removeAttribute('id');

            // Token info
            if (data.response.tokens_in || data.response.tokens_out) {
                const tokenInfo = document.createElement('div');
                tokenInfo.className = 'message-meta';
                tokenInfo.textContent = `${data.response.model} · ${data.response.tokens_in + data.response.tokens_out} tokens · ${data.response.latency_ms}ms`;
                thinkingEl.querySelector('.message-content').appendChild(tokenInfo);
            }
        }

        messagesEl.scrollTop = messagesEl.scrollHeight;
    } catch (err) {
        const thinkingEl = document.getElementById('thinking-msg');
        if (thinkingEl) {
            thinkingEl.querySelector('.message-content').innerHTML =
                `<span class="text-error">Error: ${err.message || 'No se pudo conectar con el proveedor AI'}</span>`;
            thinkingEl.removeAttribute('id');
        }
    }
}

function formatResponse(text) {
    // Básico: convertir bloques de código
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>');
    text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\n/g, '<br>');
    return text;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
</script>
