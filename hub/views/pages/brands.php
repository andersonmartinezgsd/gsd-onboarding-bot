<!-- Brand Manager -->
<div class="page-header">
    <div>
        <h2>Brand Manager</h2>
        <p class="text-muted">Gestiona marcas, paletas de colores, identidad visual y guías de estilo</p>
    </div>
</div>

<!-- Upload Zone -->
<div class="card">
    <div class="card-header">
        <h3><i class="fas fa-cloud-upload-alt"></i> Subir Assets de Marca</h3>
    </div>
    <div class="card-body">
        <div class="upload-zone" id="upload-zone"
             ondragover="event.preventDefault();this.classList.add('drag-over')"
             ondragleave="this.classList.remove('drag-over')"
             ondrop="handleDrop(event)">
            <i class="fas fa-images upload-icon"></i>
            <h3>Arrastra archivos aquí</h3>
            <p class="text-muted">Logos, capturas de pantalla, documentos de marca, videos</p>
            <p class="text-muted text-sm">PNG, JPG, SVG, PDF, MP4 — Máx 50MB</p>
            <input type="file" id="file-input" multiple accept="image/*,.pdf,.doc,.docx,.mp4,.webm" style="display:none" onchange="uploadFiles(this.files)">
            <button class="btn btn-secondary" onclick="document.getElementById('file-input').click()">
                <i class="fas fa-folder-open"></i> Seleccionar Archivos
            </button>
        </div>
        <div id="upload-progress" style="display:none">
            <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
            <span class="text-sm text-muted" id="upload-status">Subiendo...</span>
        </div>
    </div>
</div>

<!-- Crear Marca -->
<div class="card">
    <div class="card-header">
        <h3><i class="fas fa-palette"></i> Crear / Analizar Marca</h3>
    </div>
    <div class="card-body">
        <div class="brand-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="brand-name">Nombre de la marca</label>
                    <input type="text" id="brand-name" class="form-input" placeholder="AMR Tech">
                </div>
                <div class="form-group">
                    <label for="brand-desc">Descripción</label>
                    <input type="text" id="brand-desc" class="form-input" placeholder="Automatización de ventas y marketplace tecnológico">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="brand-primary">Color primario</label>
                    <div class="color-input-group">
                        <input type="color" id="brand-primary" value="#00D4FF" class="color-picker" aria-label="Selector de color primario">
                        <input type="text" class="form-input form-input-sm" value="#00D4FF" id="brand-primary-hex" aria-label="Valor hexadecimal del color primario" pattern="#[0-9A-Fa-f]{6}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="brand-secondary">Color secundario</label>
                    <div class="color-input-group">
                        <input type="color" id="brand-secondary" value="#7C3AED" class="color-picker" aria-label="Selector de color secundario">
                        <input type="text" class="form-input form-input-sm" value="#7C3AED" id="brand-secondary-hex" aria-label="Valor hexadecimal del color secundario" pattern="#[0-9A-Fa-f]{6}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="brand-accent">Color acento</label>
                    <div class="color-input-group">
                        <input type="color" id="brand-accent" value="#F59E0B" class="color-picker" aria-label="Selector de color acento">
                        <input type="text" class="form-input form-input-sm" value="#F59E0B" id="brand-accent-hex" aria-label="Valor hexadecimal del color acento" pattern="#[0-9A-Fa-f]{6}">
                    </div>
                </div>
            </div>

            <button class="btn btn-primary" onclick="generateBrandGuide()">
                <i class="fas fa-magic"></i> Generar Guía de Marca con AI
            </button>
        </div>
    </div>
</div>

<!-- Brand Guide Result -->
<div class="card" id="brand-result" style="display:none">
    <div class="card-header">
        <h3><i class="fas fa-book"></i> Guía de Marca Generada</h3>
    </div>
    <div class="card-body">
        <!-- Color Palette Preview -->
        <div class="palette-preview" id="palette-preview"></div>

        <!-- AI Generated Guide -->
        <div id="brand-guide-content" class="brand-guide"></div>
    </div>
</div>

<script>
function handleDrop(event) {
    event.preventDefault();
    event.target.closest('.upload-zone').classList.remove('drag-over');
    const files = event.dataTransfer.files;
    if (files.length > 0) uploadFiles(files);
}

async function uploadFiles(files) {
    const formData = new FormData();
    for (const file of files) {
        formData.append('files[]', file);
    }

    const progressEl = document.getElementById('upload-progress');
    const statusEl   = document.getElementById('upload-status');
    const fillEl     = document.getElementById('progress-fill');

    progressEl.style.display = 'block';
    fillEl.style.width = '0%';
    statusEl.textContent = `Subiendo ${files.length} archivo(s)...`;

    try {
        const data = await AMR.api.upload('/api/v1/documents/upload', formData);

        fillEl.style.width = '100%';
        statusEl.textContent = `${data.count} archivo(s) subidos correctamente`;

        AMR.toast.success(`${data.count} archivos subidos correctamente`);
    } catch (err) {
        fillEl.style.width = '0%';
        statusEl.textContent = 'Error subiendo archivos: ' + err.message;
        AMR.toast.error('Error: ' + err.message);
    }
}

async function generateBrandGuide() {
    const name = document.getElementById('brand-name').value.trim();
    const desc = document.getElementById('brand-desc').value.trim();
    const primary = document.getElementById('brand-primary').value;
    const secondary = document.getElementById('brand-secondary').value;
    const accent = document.getElementById('brand-accent').value;

    if (!name) {
        AMR.toast.error('Ingresa el nombre de la marca');
        return;
    }

    // Validar que los colores sean valores hex válidos antes de usarlos en CSS
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(primary) || !hexRegex.test(secondary) || !hexRegex.test(accent)) {
        AMR.toast.error('Los colores deben ser valores hexadecimales válidos (#RRGGBB)');
        return;
    }

    // Mostrar paleta — colores ya validados como hex seguro, se pueden usar en style
    document.getElementById('brand-result').style.display = 'block';
    const paletteEl = document.getElementById('palette-preview');
    paletteEl.innerHTML = '';
    [[primary, 'Primario'], [secondary, 'Secundario'], [accent, 'Acento']].forEach(([color, label]) => {
        const swatch = document.createElement('div');
        swatch.className = 'palette-swatch';
        swatch.style.background = color; // seguro: color es hex validado
        const span = document.createElement('span');
        span.textContent = color;
        const small = document.createElement('small');
        small.textContent = label;
        swatch.appendChild(span);
        swatch.appendChild(small);
        paletteEl.appendChild(swatch);
    });

    document.getElementById('brand-guide-content').innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Generando guía de marca con AI...</p>';

    const prompt = `Genera una guía de marca profesional completa para:

Marca: ${name}
Descripción: ${desc || 'Empresa de tecnología'}
Colores:
- Primario: ${primary}
- Secundario: ${secondary}
- Acento: ${accent}

Incluye:
1. Misión y visión de marca
2. Tono de voz y personalidad
3. Uso correcto de colores (primario para CTAs, secundario para elementos decorativos, etc.)
4. Tipografías recomendadas
5. Guía de uso del logo (espaciado, fondos permitidos, fondos prohibidos)
6. Ejemplos de aplicación (website, tarjetas, redes sociales)
7. Do's and Don'ts
8. Paleta extendida (colores de texto, fondos, bordes, estados semánticos)

Responde en español. Formato profesional.`;

    try {
        const data = await AMR.api.post('/api/v1/ai/chat', {
            prompt,
            model: 'qwen3:8b',
            provider: 'ollama',
        });

        // SEGURIDAD: escapar el contenido del LLM antes de formatearlo
        function escBrand(str) {
            const d = document.createElement('div');
            d.textContent = String(str ?? '');
            return d.innerHTML;
        }

        let content = escBrand(data.response.content);
        content = content.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>');
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/^### (.*?)$/gm, '<h4>$1</h4>');
        content = content.replace(/^## (.*?)$/gm, '<h3>$1</h3>');
        content = content.replace(/\n/g, '<br>');

        document.getElementById('brand-guide-content').innerHTML = content;
    } catch (err) {
        const p = document.createElement('p');
        p.className = 'text-error';
        p.textContent = 'Error: ' + (err.message || 'Error desconocido');
        const el = document.getElementById('brand-guide-content');
        el.innerHTML = '';
        el.appendChild(p);
    }
}

// Sincronizar color pickers con hex inputs
document.querySelectorAll('.color-picker').forEach(picker => {
    picker.addEventListener('input', (e) => {
        const hexInput = e.target.parentElement.querySelector('.form-input');
        if (hexInput) hexInput.value = e.target.value;
    });
});
</script>
