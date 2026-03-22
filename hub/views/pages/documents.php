<!-- Document Intelligence -->
<div class="page-header">
    <div>
        <h2>Document Intelligence</h2>
        <p class="text-muted">Sube documentos, imágenes y videos — la AI los analiza automáticamente</p>
    </div>
</div>

<!-- Upload -->
<div class="card">
    <div class="card-header"><h3><i class="fas fa-upload"></i> Subir Archivos</h3></div>
    <div class="card-body">
        <div class="upload-zone" id="doc-upload-zone"
             ondragover="event.preventDefault();this.classList.add('drag-over')"
             ondragleave="this.classList.remove('drag-over')"
             ondrop="handleDocDrop(event)">
            <i class="fas fa-file-upload upload-icon"></i>
            <h3>Arrastra archivos aquí</h3>
            <p class="text-muted">PDF, Word, Imágenes, Videos, CSV, Markdown</p>
            <input type="file" id="doc-file-input" multiple style="display:none" onchange="uploadDocs(this.files)">
            <button class="btn btn-secondary" onclick="document.getElementById('doc-file-input').click()">
                <i class="fas fa-folder-open"></i> Seleccionar
            </button>
        </div>
    </div>
</div>

<!-- Uploaded Files -->
<div class="card">
    <div class="card-header">
        <h3><i class="fas fa-list"></i> Archivos Procesados</h3>
        <button class="btn btn-sm btn-ghost" onclick="loadDocuments()"><i class="fas fa-sync-alt"></i></button>
    </div>
    <div class="card-body">
        <div id="documents-list" class="documents-grid">
            <p class="text-muted text-center">No hay documentos aún</p>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', loadDocuments);

function handleDocDrop(event) {
    event.preventDefault();
    event.target.closest('.upload-zone').classList.remove('drag-over');
    uploadDocs(event.dataTransfer.files);
}

async function uploadDocs(files) {
    const formData = new FormData();
    for (const file of files) formData.append('files[]', file);

    try {
        const response = await fetch('/api/v1/documents/upload', { method: 'POST', body: formData });
        const data = await response.json();
        AMR.toast.success(`${data.count} archivo(s) subidos`);
        loadDocuments();
    } catch (err) {
        AMR.toast.error('Error subiendo archivos');
    }
}

async function loadDocuments() {
    // Por ahora muestra los documentos del dashboard stats
    try {
        const data = await AMR.api.get('/api/v1/dashboard/stats');
        const el = document.getElementById('documents-list');
        if (data.stats.total_documents === 0) {
            el.innerHTML = '<p class="text-muted text-center">No hay documentos aún. ¡Sube uno!</p>';
        } else {
            el.innerHTML = `<p class="text-muted">${data.stats.total_documents} documento(s) procesados</p>`;
        }
    } catch (err) {
        console.error(err);
    }
}
</script>
