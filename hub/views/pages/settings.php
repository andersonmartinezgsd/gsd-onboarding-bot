<!-- Configuración -->
<div class="page-header">
    <div>
        <h2>Configuración</h2>
        <p class="text-muted">API keys, proveedores AI, preferencias del sistema</p>
    </div>
</div>

<!-- AI Providers -->
<div class="card">
    <div class="card-header"><h3><i class="fas fa-key"></i> API Keys de Proveedores AI</h3></div>
    <div class="card-body">
        <div class="settings-grid">
            <div class="setting-item">
                <div class="setting-info">
                    <h4>🦙 Ollama Local</h4>
                    <p class="text-muted">Modelos locales gratuitos. Sin API key necesaria.</p>
                </div>
                <div class="setting-control">
                    <input type="text" class="form-input" value="http://localhost:11434" id="ollama-url" placeholder="URL de Ollama">
                    <button class="btn btn-sm btn-secondary" onclick="testOllama()">Test</button>
                </div>
            </div>
            <div class="setting-item">
                <div class="setting-info">
                    <h4>🤖 OpenAI</h4>
                    <p class="text-muted">GPT-4o, GPT-5, DALL-E</p>
                </div>
                <div class="setting-control">
                    <input type="password" class="form-input" id="openai-key" placeholder="sk-...">
                    <button class="btn btn-sm btn-secondary" onclick="testOpenAi()">Test</button>
                </div>
            </div>
            <div class="setting-item">
                <div class="setting-info">
                    <h4>🧠 Anthropic</h4>
                    <p class="text-muted">Claude Opus, Sonnet, Haiku</p>
                </div>
                <div class="setting-control">
                    <input type="password" class="form-input" id="anthropic-key" placeholder="sk-ant-...">
                    <button class="btn btn-sm btn-secondary" onclick="testAnthropic()">Test</button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- System Info -->
<div class="card">
    <div class="card-header"><h3><i class="fas fa-info-circle"></i> Información del Sistema</h3></div>
    <div class="card-body">
        <div class="info-grid">
            <div class="info-item"><span class="info-label">PHP Version:</span><span><?= PHP_VERSION ?></span></div>
            <div class="info-item"><span class="info-label">Framework:</span><span>AMR Hub v1.0</span></div>
            <div class="info-item"><span class="info-label">Database:</span><span>SQLite</span></div>
            <div class="info-item"><span class="info-label">OS:</span><span><?= PHP_OS ?></span></div>
        </div>
    </div>
</div>

<script>
async function testOllama() {
    try {
        const data = await AMR.api.post('/api/v1/ai/providers/test', { provider: 'ollama' });
        AMR.toast.success(data.status.available ? 'Ollama conectado ✅' : 'Ollama no disponible ❌');
    } catch (err) {
        AMR.toast.error('Error: ' + err.message);
    }
}
</script>
