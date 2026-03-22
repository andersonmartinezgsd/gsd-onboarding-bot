<aside class="amr-sidebar">
    <div class="sidebar-brand">
        <div class="brand-logo">
            <span class="brand-icon">⚡</span>
            <span class="brand-text">AMR Hub</span>
        </div>
        <span class="brand-version">v1.0</span>
    </div>

    <nav class="sidebar-nav">
        <div class="nav-section">
            <span class="nav-section-title">Principal</span>
            <a href="/" class="nav-link <?= ($activePage ?? '') === 'home' ? 'active' : '' ?>">
                <i class="fas fa-th-large"></i>
                <span>Dashboard</span>
            </a>
            <a href="/ai-hub" class="nav-link <?= ($activePage ?? '') === 'ai-hub' ? 'active' : '' ?>">
                <i class="fas fa-robot"></i>
                <span>AI Hub</span>
                <span class="nav-badge">Chat</span>
            </a>
        </div>

        <div class="nav-section">
            <span class="nav-section-title">Desarrollo</span>
            <a href="/projects" class="nav-link <?= ($activePage ?? '') === 'projects' ? 'active' : '' ?>">
                <i class="fas fa-folder-open"></i>
                <span>Proyectos</span>
            </a>
            <a href="/agents" class="nav-link <?= ($activePage ?? '') === 'agents' ? 'active' : '' ?>">
                <i class="fas fa-users-cog"></i>
                <span>Agentes</span>
                <span class="nav-badge">20</span>
            </a>
            <a href="/agent-factory" class="nav-link <?= ($activePage ?? '') === 'agent-factory' ? 'active' : '' ?>">
                <i class="fas fa-magic"></i>
                <span>Agent Factory</span>
                <span class="nav-badge" style="background:var(--amr-secondary)">AI</span>
            </a>
        </div>

        <div class="nav-section">
            <span class="nav-section-title">Marketing</span>
            <a href="/brands" class="nav-link <?= ($activePage ?? '') === 'brands' ? 'active' : '' ?>">
                <i class="fas fa-palette"></i>
                <span>Brand Manager</span>
            </a>
            <a href="/documents" class="nav-link <?= ($activePage ?? '') === 'documents' ? 'active' : '' ?>">
                <i class="fas fa-file-alt"></i>
                <span>Documentos</span>
            </a>
        </div>

        <div class="nav-section">
            <span class="nav-section-title">Sistema</span>
            <a href="/settings" class="nav-link <?= ($activePage ?? '') === 'settings' ? 'active' : '' ?>">
                <i class="fas fa-cog"></i>
                <span>Configuración</span>
            </a>
        </div>
    </nav>

    <div class="sidebar-footer">
        <div class="ai-status">
            <span class="status-dot" id="ollama-status"></span>
            <span class="status-text">Ollama</span>
        </div>
        <div class="footer-text">AMR Tech &copy; 2026</div>
    </div>
</aside>
