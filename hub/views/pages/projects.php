<!-- Analizador de Proyectos -->
<div class="page-header">
    <div>
        <h2>Analizador de Proyectos</h2>
        <p class="text-muted">Escanea proyectos, detecta problemas, genera planes de refactoring</p>
    </div>
</div>

<!-- Scan Form -->
<div class="card">
    <div class="card-header">
        <h3><i class="fas fa-search"></i> Escanear Proyecto</h3>
    </div>
    <div class="card-body">
        <div class="scan-form">
            <div class="input-group">
                <label for="project-path" class="sr-only">Ruta del proyecto a escanear</label>
                <input type="text" id="project-path" class="form-input"
                       placeholder="Ruta del proyecto (ej: /Users/andersonmartinezrestrepo/GSD/td-dashboard)"
                       aria-label="Ruta del proyecto a escanear"
                       style="flex:1">
                <button class="btn btn-primary" onclick="scanProject()" id="scan-btn">
                    <i class="fas fa-radar" aria-hidden="true"></i> Escanear
                </button>
            </div>
            <div class="scan-presets">
                <span class="text-muted text-sm">Proyectos recientes:</span>
                <button class="preset-btn" onclick="setPath('/Users/andersonmartinezrestrepo/GSD/td-dashboard')">td-dashboard</button>
                <button class="preset-btn" onclick="setPath('/Users/andersonmartinezrestrepo/DEV-PROJECTS/Framework')">Framework</button>
            </div>
        </div>
    </div>
</div>

<!-- Resultados -->
<div id="scan-results" style="display:none">
    <!-- Summary -->
    <div class="stats-row" id="scan-stats"></div>

    <!-- Languages -->
    <div class="card">
        <div class="card-header">
            <h3><i class="fas fa-code"></i> Lenguajes Detectados</h3>
        </div>
        <div class="card-body">
            <div id="languages-chart" class="languages-bars"></div>
        </div>
    </div>

    <!-- Files Table -->
    <div class="card">
        <div class="card-header">
            <h3><i class="fas fa-file-code"></i> Archivos Escaneados</h3>
            <div class="header-actions">
                <select id="filter-category" onchange="filterFiles()" class="form-select form-select-sm">
                    <option value="">Todas las categorías</option>
                    <option value="PHP">PHP</option>
                    <option value="Script">JavaScript</option>
                    <option value="Style">CSS</option>
                    <option value="View">Vistas</option>
                    <option value="Config">Config</option>
                    <option value="API">API</option>
                </select>
            </div>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="amr-table" id="files-table">
                    <thead>
                        <tr>
                            <th onclick="sortTable(0)">Archivo <i class="fas fa-sort"></i></th>
                            <th onclick="sortTable(1)">Lenguaje</th>
                            <th onclick="sortTable(2)">Líneas <i class="fas fa-sort"></i></th>
                            <th onclick="sortTable(3)">Tamaño</th>
                            <th>Categoría</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="files-tbody"></tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- AI Analysis -->
    <div class="card">
        <div class="card-header">
            <h3><i class="fas fa-brain"></i> Análisis AI del Proyecto</h3>
            <button class="btn btn-sm btn-secondary" onclick="generateAiAnalysis()" id="analysis-btn">
                <i class="fas fa-magic"></i> Generar Análisis
            </button>
        </div>
        <div class="card-body">
            <div id="ai-analysis" class="ai-analysis-content">
                <p class="text-muted">Escanea un proyecto y luego genera el análisis AI</p>
            </div>
        </div>
    </div>
</div>

<script>
let currentProjectId = null;
let allFiles = [];

function setPath(path) {
    document.getElementById('project-path').value = path;
}

async function scanProject() {
    const path = document.getElementById('project-path').value.trim();
    if (!path) {
        AMR.toast.error('Ingresa la ruta del proyecto');
        return;
    }

    const btn = document.getElementById('scan-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Escaneando...';

    try {
        const data = await AMR.api.post('/api/v1/projects/scan', { path });
        currentProjectId = data.project_id;

        // Mostrar resultados
        document.getElementById('scan-results').style.display = 'block';

        // Stats
        document.getElementById('scan-stats').innerHTML = `
            <div class="stat-card">
                <div class="stat-icon stat-icon-primary"><i class="fas fa-file-code" aria-hidden="true"></i></div>
                <div class="stat-info"><span class="stat-value">${data.total_files}</span><span class="stat-label">Archivos</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-secondary"><i class="fas fa-code" aria-hidden="true"></i></div>
                <div class="stat-info"><span class="stat-value">${data.total_lines.toLocaleString('es-CO')}</span><span class="stat-label">Líneas de código</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-accent"><i class="fas fa-language" aria-hidden="true"></i></div>
                <div class="stat-info"><span class="stat-value">${Object.keys(data.languages).length}</span><span class="stat-label">Lenguajes</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-icon-error"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i></div>
                <div class="stat-info"><span class="stat-value">${data.issues_count}</span><span class="stat-label">Archivos &gt;200 líneas</span></div>
            </div>
        `;

        // Languages bars
        const maxLines = Math.max(...Object.values(data.languages));
        document.getElementById('languages-chart').innerHTML = Object.entries(data.languages)
            .sort((a, b) => b[1] - a[1])
            .map(([lang, lines]) => `
                <div class="lang-bar-item">
                    <span class="lang-name">${lang}</span>
                    <div class="lang-bar-track">
                        <div class="lang-bar-fill" style="width:${(lines/maxLines*100).toFixed(1)}%"></div>
                    </div>
                    <span class="lang-lines">${lines.toLocaleString()}</span>
                </div>
            `).join('');

        // Load detailed files
        const report = await AMR.api.get(`/api/v1/projects/${currentProjectId}/report`);
        allFiles = report.files || [];
        renderFiles(allFiles);

        AMR.toast.success(`Proyecto escaneado: ${data.total_files} archivos`);
    } catch (err) {
        AMR.toast.error('Error escaneando proyecto: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-radar"></i> Escanear';
    }
}

function renderFiles(files) {
    const esc = (str) => {
        const d = document.createElement('div');
        d.textContent = String(str ?? '—');
        return d.innerHTML;
    };

    const tbody = document.getElementById('files-tbody');

    if (files.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:var(--space-8)">No hay archivos en esta categoría</td></tr>';
        return;
    }

    tbody.innerHTML = files.map(f => {
        const lineClass = f.line_count > 500 ? 'text-error' : f.line_count > 200 ? 'text-warning' : 'text-success';
        const statusText = f.line_count > 500 ? 'Crítico' : f.line_count > 200 ? 'Refactorizar' : 'OK';
        const statusClass = f.line_count > 500 ? 'error' : f.line_count > 200 ? 'warning' : 'success';
        const size = f.size_bytes > 1024 ? `${(f.size_bytes/1024).toFixed(1)} KB` : `${f.size_bytes} B`;
        const category = esc(f.category || '—');
        const catLower = String(f.category || '').toLowerCase();
        return `<tr>
            <td><code class="file-path">${esc(f.file_path)}</code></td>
            <td>${esc(f.language || '—')}</td>
            <td class="${lineClass}" aria-label="${f.line_count} líneas"><strong>${esc(f.line_count)}</strong></td>
            <td>${esc(size)}</td>
            <td><span class="badge badge-${catLower}">${category}</span></td>
            <td><span class="amr-badge amr-badge-${statusClass}" aria-label="Estado: ${statusText}">${statusText}</span></td>
        </tr>`;
    }).join('');
}

function filterFiles() {
    const category = document.getElementById('filter-category').value;
    const filtered = category ? allFiles.filter(f => f.category === category) : allFiles;
    renderFiles(filtered);
}

async function generateAiAnalysis() {
    if (!currentProjectId) {
        AMR.toast.error('Escanea un proyecto primero');
        return;
    }

    const btn = document.getElementById('analysis-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analizando con AI...';

    try {
        const report = await AMR.api.get(`/api/v1/projects/${currentProjectId}/report`);
        const project = report.project;
        const files = report.files;

        const topFiles = files.slice(0, 20).map(f => `${f.file_path} (${f.line_count} líneas, ${f.category})`).join('\n');

        const prompt = `Analiza este proyecto PHP y genera un plan de refactoring:

Proyecto: ${project.name}
Total archivos: ${project.total_files}
Total líneas: ${project.total_lines}
Lenguajes: ${project.languages_json}
Archivos con problemas: ${project.issues_count}

Top archivos más grandes:
${topFiles}

Genera:
1. Resumen ejecutivo del estado del proyecto
2. Top 5 problemas críticos
3. Plan de refactoring en fases con prioridad
4. Arquitectura objetivo (siguiendo SOLID, PSR-12, Repository Pattern)
5. Estimación de esfuerzo por fase`;

        const provider = document.getElementById('ai-provider')?.value || 'ollama';
        const model = document.getElementById('ai-model')?.value || 'qwen3:8b';

        const data = await AMR.api.post('/api/v1/ai/chat', { prompt, model, provider });

        // Construir el resultado de forma segura: formatMd escapa el contenido del LLM,
        // pero los metadatos (model, tokens) se escapan explícitamente por separado.
        const analysisEl = document.getElementById('ai-analysis');
        analysisEl.innerHTML = '';

        const resultDiv = document.createElement('div');
        resultDiv.className = 'analysis-result';
        resultDiv.innerHTML = formatMd(data.response.content); // ya escapado internamente

        const metaDiv = document.createElement('div');
        metaDiv.className = 'analysis-meta text-muted text-sm';
        const totalTokens = (data.response.tokens_in ?? 0) + (data.response.tokens_out ?? 0);
        metaDiv.textContent = `Modelo: ${data.response.model ?? '—'} · ${totalTokens} tokens · ${data.response.latency_ms ?? 0}ms`;

        analysisEl.appendChild(resultDiv);
        analysisEl.appendChild(metaDiv);
    } catch (err) {
        const p = document.createElement('p');
        p.className = 'text-error';
        p.textContent = 'Error: ' + (err.message || 'Error desconocido');
        const el = document.getElementById('ai-analysis');
        el.innerHTML = '';
        el.appendChild(p);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> Generar Análisis';
    }
}

function escMd(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
}

function formatMd(text) {
    // SEGURIDAD: escapar primero para prevenir XSS desde respuestas del LLM
    let result = escMd(text);
    result = result.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>');
    result = result.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/^### (.*?)$/gm, '<h4>$1</h4>');
    result = result.replace(/^## (.*?)$/gm, '<h3>$1</h3>');
    result = result.replace(/^# (.*?)$/gm, '<h2>$1</h2>');
    result = result.replace(/\n/g, '<br>');
    return result;
}

function sortTable(col) {
    allFiles.sort((a, b) => {
        const vals = [
            [a.file_path, b.file_path],
            [a.language, b.language],
            [a.line_count, b.line_count],
            [a.size_bytes, b.size_bytes],
        ][col];
        return typeof vals[0] === 'number' ? vals[1] - vals[0] : String(vals[0]).localeCompare(String(vals[1]));
    });
    renderFiles(allFiles);
}
</script>
