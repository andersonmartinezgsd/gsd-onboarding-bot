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
                    <h4><span aria-hidden="true">🦙</span> Ollama Local</h4>
                    <p class="text-muted">Modelos locales gratuitos. Sin API key necesaria.</p>
                </div>
                <div class="setting-control">
                    <label for="ollama-url" class="sr-only">URL de Ollama</label>
                    <input type="text" class="form-input" value="http://localhost:11434" id="ollama-url"
                           placeholder="URL de Ollama" aria-label="URL del servidor Ollama">
                    <button class="btn btn-sm btn-secondary" onclick="testOllama()" aria-label="Probar conexión con Ollama">Test</button>
                </div>
            </div>
            <div class="setting-item">
                <div class="setting-info">
                    <h4><span aria-hidden="true">🤖</span> OpenAI</h4>
                    <p class="text-muted">GPT-4o, GPT-5, DALL-E</p>
                </div>
                <div class="setting-control">
                    <label for="openai-key" class="sr-only">API Key de OpenAI</label>
                    <input type="password" class="form-input" id="openai-key" placeholder="sk-..."
                           aria-label="API Key de OpenAI" autocomplete="off">
                    <button class="btn btn-sm btn-secondary" onclick="testOpenAi()" aria-label="Probar conexión con OpenAI">Test</button>
                </div>
            </div>
            <div class="setting-item">
                <div class="setting-info">
                    <h4><span aria-hidden="true">🧠</span> Anthropic</h4>
                    <p class="text-muted">Claude Opus, Sonnet, Haiku</p>
                </div>
                <div class="setting-control">
                    <label for="anthropic-key" class="sr-only">API Key de Anthropic</label>
                    <input type="password" class="form-input" id="anthropic-key" placeholder="sk-ant-..."
                           aria-label="API Key de Anthropic" autocomplete="off">
                    <button class="btn btn-sm btn-secondary" onclick="testAnthropic()" aria-label="Probar conexión con Anthropic">Test</button>
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
        if (data.status.available) {
            AMR.toast.success('Ollama conectado correctamente');
        } else {
            AMR.toast.warning('Ollama no está disponible');
        }
    } catch (err) {
        AMR.toast.error('Error probando Ollama: ' + err.message);
    }
}

async function testOpenAi() {
    try {
        const data = await AMR.api.post('/api/v1/ai/providers/test', { provider: 'openai' });
        if (data.status.available) {
            AMR.toast.success('OpenAI conectado correctamente');
        } else {
            AMR.toast.warning('OpenAI no está disponible. Verifica la API key.');
        }
    } catch (err) {
        AMR.toast.error('Error probando OpenAI: ' + err.message);
    }
}

async function testAnthropic() {
    try {
        const data = await AMR.api.post('/api/v1/ai/providers/test', { provider: 'anthropic' });
        if (data.status.available) {
            AMR.toast.success('Anthropic conectado correctamente');
        } else {
            AMR.toast.warning('Anthropic no está disponible. Verifica la API key.');
        }
    } catch (err) {
        AMR.toast.error('Error probando Anthropic: ' + err.message);
    }
}
</script>
