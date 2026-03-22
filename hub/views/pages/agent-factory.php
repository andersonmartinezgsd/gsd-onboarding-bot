<!-- Agent Factory — Wizard para crear agentes en segundos -->
<div class="page-header">
    <div>
        <h2>Agent Factory</h2>
        <p class="text-muted">Escribe el cargo, las habilidades y la AI crea el agente completo listo para usar</p>
    </div>
</div>

<!-- Wizard Steps -->
<div class="factory-wizard">
    <!-- Step indicators — rol de lista de pasos para lectores de pantalla -->
    <ol class="wizard-steps" aria-label="Pasos del wizard">
        <li class="wizard-step active" data-step="1" aria-current="step">
            <span class="step-number" aria-hidden="true">1</span>
            <span class="step-label">Identidad</span>
        </li>
        <li class="wizard-step-line" role="presentation"></li>
        <li class="wizard-step" data-step="2">
            <span class="step-number" aria-hidden="true">2</span>
            <span class="step-label">Skills</span>
        </li>
        <li class="wizard-step-line" role="presentation"></li>
        <li class="wizard-step" data-step="3">
            <span class="step-number" aria-hidden="true">3</span>
            <span class="step-label">Generar</span>
        </li>
        <li class="wizard-step-line" role="presentation"></li>
        <li class="wizard-step" data-step="4">
            <span class="step-number" aria-hidden="true">4</span>
            <span class="step-label">Integrar</span>
        </li>
    </ol>

    <!-- ═══ PASO 1: Identidad ═══ -->
    <div class="wizard-panel active" id="step-1">
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-user-tag"></i> ¿Quién es tu agente?</h3>
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label for="f-name">Nombre del cargo o agente <span class="required">*</span></label>
                    <input type="text" id="f-name" class="form-input form-input-lg"
                           placeholder="Ej: Director de Marketing Digital, CTO, Community Manager, Analista SEO..."
                           aria-required="true">
                    <span class="form-hint" id="f-name-hint">Solo escribe el cargo — la AI se encarga del resto</span>
                </div>

                <div class="form-group">
                    <label for="f-role">Rol / Descripción rápida</label>
                    <input type="text" id="f-role" class="form-input" placeholder="Ej: Encargado de la estrategia digital y campañas publicitarias">
                    <span class="form-hint">Opcional — si lo dejas vacío la AI lo infiere del cargo</span>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="f-category">Categoría</label>
                        <select id="f-category" class="form-select">
                            <option value="marketing">📈 Marketing</option>
                            <option value="development">🏗️ Desarrollo</option>
                            <option value="automation">🤖 Automatización</option>
                            <option value="analytics">📊 Analytics</option>
                            <option value="sales">💼 Ventas</option>
                            <option value="design">🎨 Diseño</option>
                            <option value="operations">⚙️ Operaciones</option>
                            <option value="finance">💰 Finanzas</option>
                            <option value="hr">👥 Recursos Humanos</option>
                            <option value="legal">⚖️ Legal</option>
                            <option value="support">🎧 Soporte</option>
                            <option value="security">🔒 Seguridad</option>
                            <option value="custom">⚡ Custom</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="f-context">Contexto adicional</label>
                        <input type="text" id="f-context" class="form-input" placeholder="Ej: Para empresa SaaS B2B, enfoque en Latinoamérica">
                    </div>
                </div>

                <div class="wizard-actions">
                    <div></div>
                    <button class="btn btn-primary btn-lg" onclick="goToStep(2)">
                        Siguiente: Skills <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ═══ PASO 2: Skills y Funciones ═══ -->
    <div class="wizard-panel" id="step-2">
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-tools"></i> Skills, Habilidades y Funciones</h3>
            </div>
            <div class="card-body">
                <!-- Skills con tags -->
                <div class="form-group">
                    <label for="f-skill-input">Skills / Habilidades <span class="required">*</span></label>
                    <div class="tag-input-container">
                        <div class="tags-display" id="skills-tags" role="list" aria-label="Skills agregados"></div>
                        <input type="text" id="f-skill-input" class="form-input"
                               placeholder="Escribe un skill y presiona Enter..."
                               aria-required="true"
                               onkeydown="if(event.key==='Enter'){event.preventDefault();addTag('skills',this)}">
                    </div>
                    <span class="form-hint">Enter para agregar · Ejemplos: SEO, copywriting, análisis de datos, diseño UI/UX</span>

                    <!-- Quick-add presets -->
                    <div class="tag-presets">
                        <span class="preset-label">Agregar rápido:</span>
                        <div class="preset-groups">
                            <div class="preset-group">
                                <span class="preset-group-title">Marketing</span>
                                <button class="tag-preset" onclick="addPresetTag('skills','SEO')">SEO</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','SEM/Google Ads')">SEM</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Email Marketing')">Email</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Copywriting')">Copy</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Social Media')">Social</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Content Strategy')">Content</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Analytics')">Analytics</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Branding')">Branding</button>
                            </div>
                            <div class="preset-group">
                                <span class="preset-group-title">Desarrollo</span>
                                <button class="tag-preset" onclick="addPresetTag('skills','PHP 8.4+')">PHP</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','JavaScript/Node.js')">JS/Node</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','MySQL/SQLite')">SQL</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','REST APIs')">APIs</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','SOLID/PSR-12')">SOLID</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Git/GitHub')">Git</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Testing/PHPUnit')">Testing</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','CSS/Design System')">CSS</button>
                            </div>
                            <div class="preset-group">
                                <span class="preset-group-title">Automatización</span>
                                <button class="tag-preset" onclick="addPresetTag('skills','n8n Workflows')">n8n</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Webhooks')">Webhooks</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Cron Jobs')">Cron</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Scraping')">Scraping</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','Chatbots')">Chatbots</button>
                                <button class="tag-preset" onclick="addPresetTag('skills','WhatsApp API')">WhatsApp</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Funciones con tags -->
                <div class="form-group">
                    <label for="f-function-input">Funciones principales</label>
                    <div class="tag-input-container">
                        <div class="tags-display" id="functions-tags" role="list" aria-label="Funciones agregadas"></div>
                        <input type="text" id="f-function-input" class="form-input"
                               placeholder="Escribe una función y presiona Enter..."
                               onkeydown="if(event.key==='Enter'){event.preventDefault();addTag('functions',this)}">
                    </div>
                    <span class="form-hint">Ej: Crear campañas, analizar métricas, generar reportes, optimizar landing pages</span>
                </div>

                <!-- Herramientas del agente -->
                <div class="form-group">
                    <label>Herramientas permitidas (para OpenCode)</label>
                    <div class="tools-checkboxes">
                        <label class="checkbox-item"><input type="checkbox" value="Bash" checked class="tool-check"> <i class="fas fa-terminal"></i> Bash</label>
                        <label class="checkbox-item"><input type="checkbox" value="Read" checked class="tool-check"> <i class="fas fa-eye"></i> Read</label>
                        <label class="checkbox-item"><input type="checkbox" value="Write" checked class="tool-check"> <i class="fas fa-pen"></i> Write</label>
                        <label class="checkbox-item"><input type="checkbox" value="Edit" checked class="tool-check"> <i class="fas fa-edit"></i> Edit</label>
                        <label class="checkbox-item"><input type="checkbox" value="Glob" checked class="tool-check"> <i class="fas fa-search"></i> Glob</label>
                        <label class="checkbox-item"><input type="checkbox" value="Grep" checked class="tool-check"> <i class="fas fa-file-search"></i> Grep</label>
                        <label class="checkbox-item"><input type="checkbox" value="Agent" class="tool-check"> <i class="fas fa-users"></i> Agent</label>
                        <label class="checkbox-item"><input type="checkbox" value="WebFetch" class="tool-check"> <i class="fas fa-globe"></i> WebFetch</label>
                        <label class="checkbox-item"><input type="checkbox" value="WebSearch" class="tool-check"> <i class="fas fa-search-plus"></i> WebSearch</label>
                        <label class="checkbox-item"><input type="checkbox" value="NotebookEdit" class="tool-check"> <i class="fas fa-book"></i> Notebook</label>
                    </div>
                </div>

                <div class="wizard-actions">
                    <button class="btn btn-ghost" onclick="goToStep(1)">
                        <i class="fas fa-arrow-left"></i> Atrás
                    </button>
                    <button class="btn btn-primary btn-lg" onclick="generateAgentWithAI()">
                        <i class="fas fa-magic"></i> Generar Agente con AI
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ═══ PASO 3: Preview y Edición ═══ -->
    <div class="wizard-panel" id="step-3">
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-eye"></i> Preview del Agente Generado</h3>
                <div class="header-actions">
                    <span class="text-muted text-sm" id="gen-meta"></span>
                </div>
            </div>
            <div class="card-body">
                <!-- Loading -->
                <div id="gen-loading" style="display:none">
                    <div class="gen-loading-content">
                        <div class="gen-spinner"></div>
                        <h3>Generando agente con AI...</h3>
                        <p class="text-muted">Creando system prompt, capabilities, configuración de OpenCode</p>
                    </div>
                </div>

                <!-- Preview Card -->
                <div id="gen-preview" style="display:none">
                    <!-- Agent Card Preview -->
                    <div class="preview-agent-card" id="preview-card">
                        <div class="preview-header">
                            <span class="preview-icon" id="preview-icon">🤖</span>
                            <div>
                                <h3 id="preview-name">—</h3>
                                <span class="preview-category" id="preview-category">—</span>
                            </div>
                        </div>
                        <p class="preview-desc" id="preview-desc">—</p>
                        <div class="preview-caps" id="preview-caps"></div>
                    </div>

                    <!-- Editable fields -->
                    <div class="preview-edit-section">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-agent-id">Agent ID</label>
                                <input type="text" id="edit-agent-id" class="form-input form-input-mono">
                            </div>
                            <div class="form-group">
                                <label for="edit-icon">Icono</label>
                                <input type="text" id="edit-icon" class="form-input" style="width:80px;font-size:24px;text-align:center">
                            </div>
                            <div class="form-group">
                                <label for="edit-model">Modelo preferido</label>
                                <select id="edit-model" class="form-select">
                                    <option value="qwen3:8b">qwen3:8b (Local)</option>
                                    <option value="qwen3-coder">qwen3-coder (Local)</option>
                                    <option value="deepseek-coder">deepseek-coder (Local)</option>
                                    <option value="llama3.1">llama3.1 (Local)</option>
                                    <option value="claude-opus-4-20250514">Claude Opus 4</option>
                                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                                    <option value="gpt-4o">GPT-4o</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="edit-desc">Descripción</label>
                            <textarea id="edit-desc" class="form-textarea" rows="2"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="edit-system-prompt">System Prompt <span class="text-muted text-sm">(editable)</span></label>
                            <textarea id="edit-system-prompt" class="form-textarea form-textarea-mono" rows="12"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="edit-opencode-md">OpenCode .md <span class="text-muted text-sm">(se guardará en ~/.config/opencode/agents/)</span></label>
                            <textarea id="edit-opencode-md" class="form-textarea form-textarea-mono" rows="10"></textarea>
                        </div>
                    </div>

                    <div class="wizard-actions">
                        <button class="btn btn-ghost" onclick="goToStep(2)">
                            <i class="fas fa-arrow-left"></i> Atrás
                        </button>
                        <div class="action-group">
                            <button class="btn btn-secondary" onclick="generateAgentWithAI()">
                                <i class="fas fa-redo"></i> Regenerar
                            </button>
                            <button class="btn btn-primary btn-lg" onclick="integrateAgent()">
                                <i class="fas fa-rocket"></i> Integrar al Sistema
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ═══ PASO 4: Confirmación ═══ -->
    <div class="wizard-panel" id="step-4">
        <div class="card">
            <div class="card-body" style="text-align:center;padding:var(--space-16) var(--space-6)">
                <div class="success-animation">
                    <div class="success-icon">✅</div>
                    <h2>¡Agente Creado e Integrado!</h2>
                    <p class="text-muted" id="success-message">—</p>
                </div>

                <div class="success-details" id="success-details"></div>

                <div class="success-actions">
                    <a href="/agents" class="btn btn-secondary">
                        <i class="fas fa-users-cog"></i> Ver Todos los Agentes
                    </a>
                    <button class="btn btn-primary" onclick="resetFactory()">
                        <i class="fas fa-plus"></i> Crear Otro Agente
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ═══ Templates rápidos ═══ -->
<div class="card">
    <div class="card-header">
        <h3><i class="fas fa-bolt"></i> Templates Rápidos</h3>
        <span class="text-muted text-sm">Un clic = agente listo</span>
    </div>
    <div class="card-body">
        <div class="templates-grid">
            <button class="template-card" onclick="loadTemplate('cmo')">
                <span class="template-icon">📈</span>
                <span class="template-name">CMO</span>
                <span class="template-desc">Chief Marketing Officer</span>
            </button>
            <button class="template-card" onclick="loadTemplate('cto')">
                <span class="template-icon">💻</span>
                <span class="template-name">CTO</span>
                <span class="template-desc">Chief Technology Officer</span>
            </button>
            <button class="template-card" onclick="loadTemplate('community')">
                <span class="template-icon">💬</span>
                <span class="template-name">Community Manager</span>
                <span class="template-desc">Gestión de comunidades</span>
            </button>
            <button class="template-card" onclick="loadTemplate('copywriter')">
                <span class="template-icon">✍️</span>
                <span class="template-name">Copywriter</span>
                <span class="template-desc">Redacción persuasiva</span>
            </button>
            <button class="template-card" onclick="loadTemplate('product')">
                <span class="template-icon">📦</span>
                <span class="template-name">Product Manager</span>
                <span class="template-desc">Gestión de producto</span>
            </button>
            <button class="template-card" onclick="loadTemplate('growth')">
                <span class="template-icon">🚀</span>
                <span class="template-name">Growth Hacker</span>
                <span class="template-desc">Crecimiento acelerado</span>
            </button>
            <button class="template-card" onclick="loadTemplate('designer')">
                <span class="template-icon">🎨</span>
                <span class="template-name">UI/UX Designer</span>
                <span class="template-desc">Diseño de interfaces</span>
            </button>
            <button class="template-card" onclick="loadTemplate('scrum')">
                <span class="template-icon">📋</span>
                <span class="template-name">Scrum Master</span>
                <span class="template-desc">Metodologías ágiles</span>
            </button>
            <button class="template-card" onclick="loadTemplate('accountant')">
                <span class="template-icon">💰</span>
                <span class="template-name">Contador</span>
                <span class="template-desc">Contabilidad y finanzas</span>
            </button>
            <button class="template-card" onclick="loadTemplate('lawyer')">
                <span class="template-icon">⚖️</span>
                <span class="template-name">Asesor Legal</span>
                <span class="template-desc">Contratos y cumplimiento</span>
            </button>
            <button class="template-card" onclick="loadTemplate('recruiter')">
                <span class="template-icon">👥</span>
                <span class="template-name">Recruiter</span>
                <span class="template-desc">Reclutamiento de talento</span>
            </button>
            <button class="template-card" onclick="loadTemplate('support')">
                <span class="template-icon">🎧</span>
                <span class="template-name">Soporte Técnico</span>
                <span class="template-desc">Atención y resolución</span>
            </button>
        </div>
    </div>
</div>

<style>
/* ── Factory Wizard ──────────────────────────── */
.factory-wizard { margin-bottom: var(--space-6); }

.wizard-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-bottom: var(--space-8);
    padding: var(--space-6) 0;
}

.wizard-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    position: relative;
}

.step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--amr-bg-elevated);
    border: 2px solid var(--amr-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: var(--text-sm);
    transition: all var(--transition-base);
}

.wizard-step.active .step-number {
    background: var(--amr-primary);
    border-color: var(--amr-primary);
    color: var(--amr-bg-base);
    box-shadow: var(--shadow-glow);
}

.wizard-step.completed .step-number {
    background: var(--amr-success);
    border-color: var(--amr-success);
    color: white;
}

.step-label {
    font-size: var(--text-xs);
    color: var(--amr-text-muted);
    font-weight: 500;
}

.wizard-step.active .step-label { color: var(--amr-primary); }

.wizard-step-line {
    width: 60px;
    height: 2px;
    background: var(--amr-border);
    margin: 0 var(--space-2);
    margin-bottom: 20px;
}

.wizard-panel { display: none; }
.wizard-panel.active { display: block; }

.wizard-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-6);
    padding-top: var(--space-4);
    border-top: 1px solid var(--amr-border);
}

.action-group { display: flex; gap: var(--space-3); }

.btn-lg { padding: var(--space-3) var(--space-6); font-size: var(--text-base); }

.form-input-lg { font-size: var(--text-lg); padding: var(--space-3) var(--space-4); }

.form-input-mono, .form-textarea-mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
}

.form-hint {
    display: block;
    font-size: var(--text-xs);
    color: var(--amr-text-muted);
    margin-top: var(--space-1);
}

.required { color: var(--amr-error); }

/* ── Tag Input ────────────────────────────────── */
.tag-input-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.tags-display {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    min-height: 8px;
}

.tag-item {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    background: var(--amr-primary-alpha-15);
    color: var(--amr-primary-light);
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    animation: tagIn 0.2s ease;
}

@keyframes tagIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.tag-remove {
    background: none;
    border: none;
    color: var(--amr-primary);
    cursor: pointer;
    font-size: var(--text-xs);
    padding: 0 2px;
    opacity: 0.7;
}

.tag-remove:hover { opacity: 1; }

/* ── Tag Presets ──────────────────────────────── */
.tag-presets {
    margin-top: var(--space-3);
}

.preset-label {
    font-size: var(--text-xs);
    color: var(--amr-text-muted);
    display: block;
    margin-bottom: var(--space-2);
}

.preset-groups {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.preset-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    align-items: center;
}

.preset-group-title {
    font-size: var(--text-xs);
    color: var(--amr-text-muted);
    font-weight: 600;
    margin-right: var(--space-2);
    min-width: 100px;
}

.tag-preset {
    background: var(--amr-bg-elevated);
    border: 1px solid var(--amr-border);
    color: var(--amr-text-secondary);
    padding: 2px 10px;
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.tag-preset:hover {
    border-color: var(--amr-primary);
    color: var(--amr-primary);
    background: var(--amr-primary-alpha-08);
}

.tag-preset.added {
    background: var(--amr-primary-alpha-15);
    color: var(--amr-primary);
    border-color: var(--amr-primary);
}

/* ── Tools Checkboxes ─────────────────────────── */
.tools-checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--amr-text-secondary);
    cursor: pointer;
}

.checkbox-item input { accent-color: var(--amr-primary); }
.checkbox-item i { color: var(--amr-text-muted); font-size: var(--text-xs); }

/* ── Generation Loading ───────────────────────── */
.gen-loading-content {
    text-align: center;
    padding: var(--space-16) 0;
}

.gen-spinner {
    width: 60px;
    height: 60px;
    border: 3px solid var(--amr-border);
    border-top-color: var(--amr-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto var(--space-4);
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Preview Card ─────────────────────────────── */
.preview-agent-card {
    background: var(--amr-bg-elevated);
    border: 1px solid var(--amr-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    margin-bottom: var(--space-6);
    box-shadow: var(--shadow-glow);
}

.preview-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-3);
}

.preview-icon { font-size: 48px; }
.preview-header h3 { font-size: var(--text-xl); font-weight: 700; }

.preview-category {
    font-size: var(--text-xs);
    color: var(--amr-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
}

.preview-desc {
    color: var(--amr-text-secondary);
    font-size: var(--text-sm);
    margin-bottom: var(--space-4);
    line-height: 1.6;
}

.preview-caps {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.preview-cap {
    background: var(--amr-secondary-alpha-15);
    color: var(--amr-secondary-light);
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
}

.preview-edit-section {
    border-top: 1px solid var(--amr-border);
    padding-top: var(--space-6);
}

/* ── Success ──────────────────────────────────── */
.success-icon { font-size: 64px; margin-bottom: var(--space-4); }
.success-animation h2 {
    font-family: var(--font-display);
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
    background: var(--amr-gradient-brand);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.success-details {
    background: var(--amr-bg-elevated);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    margin: var(--space-6) auto;
    max-width: 500px;
    text-align: left;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--amr-text-secondary);
}

.success-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: center;
    margin-top: var(--space-6);
}

/* ── Templates Grid ───────────────────────────── */
.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--space-3);
}

.template-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-4);
    background: var(--amr-bg-elevated);
    border: 1px solid var(--amr-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: center;
}

.template-card:hover {
    border-color: var(--amr-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.template-icon { font-size: 28px; }
.template-name { font-size: var(--text-sm); font-weight: 600; color: var(--amr-text-primary); }
.template-desc { font-size: var(--text-xs); color: var(--amr-text-muted); }
</style>

<script>
// ═══ Estado ═══
const agentState = {
    skills: [],
    functions: [],
    generatedAgent: null,
    currentStep: 1,
};

// ═══ Navigation ═══
function goToStep(step) {
    // Validar paso 1
    if (step > 1 && !document.getElementById('f-name').value.trim()) {
        AMR.toast.error('Escribe el nombre del cargo o agente');
        document.getElementById('f-name').focus();
        return;
    }

    // Validar paso 2
    if (step > 2 && agentState.skills.length === 0) {
        AMR.toast.error('Agrega al menos un skill');
        document.getElementById('f-skill-input').focus();
        return;
    }

    agentState.currentStep = step;

    // Actualizar indicadores + aria-current para lectores de pantalla
    document.querySelectorAll('.wizard-step').forEach(el => {
        const s = parseInt(el.dataset.step);
        el.classList.remove('active', 'completed');
        el.removeAttribute('aria-current');
        if (s === step) {
            el.classList.add('active');
            el.setAttribute('aria-current', 'step');
        }
        if (s < step) el.classList.add('completed');
    });

    // Mostrar panel
    document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
}

// ═══ Tags ═══
function addTag(type, input) {
    const value = input.value.trim();
    if (!value || agentState[type].includes(value)) {
        input.value = '';
        return;
    }

    agentState[type].push(value);
    renderTags(type);
    input.value = '';
}

function addPresetTag(type, value) {
    if (agentState[type].includes(value)) return;
    agentState[type].push(value);
    renderTags(type);

    // Marcar botón como agregado
    document.querySelectorAll('.tag-preset').forEach(btn => {
        if (btn.textContent.trim() === value || btn.onclick.toString().includes(`'${value}'`)) {
            btn.classList.add('added');
        }
    });
}

function removeTag(type, index) {
    agentState[type].splice(index, 1);
    renderTags(type);
}

function renderTags(type) {
    const container = document.getElementById(`${type}-tags`);
    container.innerHTML = '';

    agentState[type].forEach((tag, i) => {
        // Usar textContent para evitar XSS — el tag es input del usuario
        const span = document.createElement('span');
        span.className = 'tag-item';
        span.setAttribute('role', 'listitem');

        const text = document.createTextNode(tag);
        span.appendChild(text);

        const btn = document.createElement('button');
        btn.className = 'tag-remove';
        btn.setAttribute('aria-label', `Eliminar ${tag}`);
        btn.textContent = '×';
        btn.addEventListener('click', () => removeTag(type, i));
        span.appendChild(btn);

        container.appendChild(span);
    });
}

// ═══ Generate Agent ═══
async function generateAgentWithAI() {
    goToStep(3);

    const loading = document.getElementById('gen-loading');
    const preview = document.getElementById('gen-preview');
    loading.style.display = 'block';
    preview.style.display = 'none';

    const tools = [...document.querySelectorAll('.tool-check:checked')].map(c => c.value);

    try {
        const data = await AMR.api.post('/api/v1/agents/generate', {
            name: document.getElementById('f-name').value.trim(),
            role: document.getElementById('f-role').value.trim(),
            category: document.getElementById('f-category').value,
            context: document.getElementById('f-context').value.trim(),
            skills: agentState.skills,
            functions: agentState.functions,
            tools: tools,
            provider: 'ollama',
            model: 'qwen3:8b',
        });

        agentState.generatedAgent = data.agent;

        // Llenar preview
        document.getElementById('preview-icon').textContent = data.agent.icon || '🤖';
        document.getElementById('preview-name').textContent = data.agent.name || '—';
        document.getElementById('preview-category').textContent = data.agent.category || '—';
        document.getElementById('preview-desc').textContent = data.agent.description || '—';

        // Renderizar capabilities con textContent para evitar XSS
        const caps = data.agent.capabilities || [];
        const capsContainer = document.getElementById('preview-caps');
        capsContainer.innerHTML = '';
        caps.forEach(cap => {
            const span = document.createElement('span');
            span.className = 'preview-cap';
            span.textContent = cap;
            capsContainer.appendChild(span);
        });

        // Llenar campos editables
        document.getElementById('edit-agent-id').value = data.agent.agent_id || '';
        document.getElementById('edit-icon').value = data.agent.icon || '🤖';
        document.getElementById('edit-desc').value = data.agent.description || '';
        document.getElementById('edit-system-prompt').value = data.agent.system_prompt || '';
        document.getElementById('edit-opencode-md').value = data.agent.opencode_md || '';
        document.getElementById('edit-model').value = data.agent.preferred_model || 'qwen3:8b';

        document.getElementById('gen-meta').textContent = `${data.tokens} tokens · ${data.latency}ms`;

        loading.style.display = 'none';
        preview.style.display = 'block';

        AMR.toast.success('Agente generado exitosamente');

    } catch (err) {
        loading.style.display = 'none';
        AMR.toast.error('Error generando agente: ' + err.message);
        goToStep(2);
    }
}

// ═══ Integrate Agent ═══
async function integrateAgent() {
    const agent = {
        ...agentState.generatedAgent,
        agent_id: document.getElementById('edit-agent-id').value.trim(),
        icon: document.getElementById('edit-icon').value.trim(),
        description: document.getElementById('edit-desc').value.trim(),
        system_prompt: document.getElementById('edit-system-prompt').value.trim(),
        opencode_md: document.getElementById('edit-opencode-md').value.trim(),
        preferred_model: document.getElementById('edit-model').value,
    };

    try {
        const data = await AMR.api.post('/api/v1/agents/export-md', { agent });

        document.getElementById('success-message').textContent = data.message || '¡Completado!';

        // Construir detalles con textContent para evitar XSS con datos de la API
        const details = document.getElementById('success-details');
        details.innerHTML = '';

        const rows = [
            ['Agent ID', data.agent_id ?? '—'],
            ['Archivo .md', data.md_path ?? '—'],
            ['Base de datos', '✅ Registrado'],
            ['OpenCode', '✅ Integrado'],
        ];
        rows.forEach(([label, value]) => {
            const div = document.createElement('div');
            const strong = document.createElement('strong');
            strong.textContent = label + ': ';
            div.appendChild(strong);
            div.appendChild(document.createTextNode(value));
            details.appendChild(div);
        });

        // Línea del comando de uso
        const cmdDiv = document.createElement('div');
        cmdDiv.style.marginTop = '8px';
        cmdDiv.style.color = 'var(--amr-primary)';
        cmdDiv.appendChild(document.createTextNode('Usa: '));
        const code = document.createElement('code');
        code.textContent = `opencode --agent ${data.agent_id ?? ''}`;
        cmdDiv.appendChild(code);
        details.appendChild(cmdDiv);

        goToStep(4);
        AMR.toast.success('¡Agente integrado al sistema!');

    } catch (err) {
        AMR.toast.error('Error integrando agente: ' + err.message);
    }
}

// ═══ Templates ═══
const TEMPLATES = {
    cmo: { name: 'Chief Marketing Officer', category: 'marketing', role: 'Líder de estrategia de marketing, branding y growth', skills: ['Marketing Strategy', 'Branding', 'Growth Marketing', 'Analytics', 'Budget Management', 'Team Leadership'] },
    cto: { name: 'Chief Technology Officer', category: 'development', role: 'Líder técnico, arquitectura de sistemas, decisiones tecnológicas', skills: ['System Architecture', 'PHP 8.4+', 'JavaScript/Node.js', 'SOLID/PSR-12', 'DevOps', 'Team Leadership', 'Technical Decisions'] },
    community: { name: 'Community Manager', category: 'marketing', role: 'Gestión de comunidades online y engagement', skills: ['Social Media', 'Content Creation', 'Community Building', 'Crisis Management', 'Analytics', 'Copywriting'] },
    copywriter: { name: 'Copywriter Senior', category: 'marketing', role: 'Redacción persuasiva para web, ads y email', skills: ['Copywriting', 'SEO Writing', 'Email Marketing', 'Ad Copy', 'Storytelling', 'A/B Testing'] },
    product: { name: 'Product Manager', category: 'operations', role: 'Gestión de producto digital, roadmap y priorización', skills: ['Product Strategy', 'User Research', 'Agile/Scrum', 'Data Analysis', 'Stakeholder Management', 'Roadmapping'] },
    growth: { name: 'Growth Hacker', category: 'marketing', role: 'Crecimiento acelerado con experimentación rápida', skills: ['Growth Strategy', 'A/B Testing', 'Funnel Optimization', 'SEO', 'Viral Marketing', 'Data Analytics', 'Automation'] },
    designer: { name: 'UI/UX Designer', category: 'design', role: 'Diseño de interfaces y experiencia de usuario', skills: ['UI Design', 'UX Research', 'Wireframing', 'Design Systems', 'CSS/Design System', 'Accessibility', 'Prototyping'] },
    scrum: { name: 'Scrum Master', category: 'operations', role: 'Facilitador de metodologías ágiles', skills: ['Scrum Framework', 'Sprint Planning', 'Retrospectives', 'Team Facilitation', 'Impediment Removal', 'Agile Metrics'] },
    accountant: { name: 'Contador / CFO', category: 'finance', role: 'Contabilidad, finanzas y reportes fiscales', skills: ['Accounting', 'Financial Reporting', 'Tax Compliance', 'Budgeting', 'Cash Flow Management', 'Financial Analysis'] },
    lawyer: { name: 'Asesor Legal', category: 'legal', role: 'Contratos, cumplimiento regulatorio y protección legal', skills: ['Contract Review', 'Regulatory Compliance', 'IP Protection', 'Data Privacy/GDPR', 'Terms of Service', 'Risk Assessment'] },
    recruiter: { name: 'Talent Recruiter', category: 'hr', role: 'Reclutamiento, selección y onboarding de talento', skills: ['Talent Sourcing', 'Interviewing', 'ATS Management', 'Employer Branding', 'Onboarding', 'Salary Negotiation'] },
    support: { name: 'Soporte Técnico Lead', category: 'support', role: 'Atención al cliente y resolución de problemas técnicos', skills: ['Customer Support', 'Troubleshooting', 'Knowledge Base', 'Ticketing Systems', 'SLA Management', 'Escalation Handling'] },
};

function loadTemplate(key) {
    const t = TEMPLATES[key];
    if (!t) return;

    document.getElementById('f-name').value = t.name;
    document.getElementById('f-role').value = t.role || '';
    document.getElementById('f-category').value = t.category;

    agentState.skills = [...t.skills];
    agentState.functions = [];
    renderTags('skills');
    renderTags('functions');

    AMR.toast.info(`Template "${t.name}" cargado`);
    goToStep(2);
}

function resetFactory() {
    agentState.skills = [];
    agentState.functions = [];
    agentState.generatedAgent = null;

    document.getElementById('f-name').value = '';
    document.getElementById('f-role').value = '';
    document.getElementById('f-context').value = '';
    renderTags('skills');
    renderTags('functions');

    document.querySelectorAll('.tag-preset').forEach(b => b.classList.remove('added'));

    goToStep(1);
}
</script>
