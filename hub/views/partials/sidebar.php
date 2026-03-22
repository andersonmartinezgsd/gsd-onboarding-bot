<aside class="amr-sidebar" role="complementary" aria-label="Navegación principal">
    <div class="sidebar-brand">
        <div class="brand-logo">
            <span class="brand-icon" aria-hidden="true">⚡</span>
            <span class="brand-text">AMR Hub</span>
        </div>
        <span class="brand-version" aria-label="Versión 1.0">v1.0</span>
    </div>

    <nav class="sidebar-nav" role="navigation" aria-label="Menú principal">
        <div class="nav-section">
            <span class="nav-section-title" id="nav-label-principal">Principal</span>
            <a href="/" class="nav-link <?= ($activePage ?? '') === 'home' ? 'active' : '' ?>"
               <?= ($activePage ?? '') === 'home' ? 'aria-current="page"' : '' ?>>
                <i class="fas fa-th-large" aria-hidden="true"></i>
                <span>Dashboard</span>
            </a>
            <a href="/ai-hub" class="nav-link <?= ($activePage ?? '') === 'ai-hub' ? 'active' : '' ?>"
               <?= ($activePage ?? '') === 'ai-hub' ? 'aria-current="page"' : '' ?>>
                <i class="fas fa-robot" aria-hidden="true"></i>
                <span>AI Hub</span>
                <span class="nav-badge" aria-label="Chat disponible">Chat</span>
            </a>
        </div>

        <div class="nav-section">
            <span class="nav-section-title" id="nav-label-desarrollo">Desarrollo</span>
            <a href="/projects" class="nav-link <?= ($activePage ?? '') === 'projects' ? 'active' : '' ?>"
               <?= ($activePage ?? '') === 'projects' ? 'aria-current="page"' : '' ?>>
                <i class="fas fa-folder-open" aria-hidden="true"></i>
                <span>Proyectos</span>
            </a>
            <a href="/agents" class="nav-link <?= ($activePage ?? '') === 'agents' ? 'active' : '' ?>"
               <?= ($activePage ?? '') === 'agents' ? 'aria-current="page"' : '' ?>>
                <i class="fas fa-users-cog" aria-hidden="true"></i>
                <span>Agentes</span>
                <span class="nav-badge" aria-label="20 agentes">20</span>
            </a>
            <a href="/agent-factory" class="nav-link <?= ($activePage ?? '') === 'agent-factory' ? 'active' : '' ?>"
               <?= ($activePage ?? '') === 'agent-factory' ? 'aria-current="page"' : '' ?>>
                <i class="fas fa-magic" aria-hidden="true"></i>
                <span>Agent Factory</span>
                <span class="nav-badge nav-badge-secondary" aria-label="Función AI">AI</span>
            </a>
        </div>

        <div class="nav-section">
            <span class="nav-section-title" id="nav-label-marketing">Marketing</span>
            <a href="/brands" class="nav-link <?= ($activePage ?? '') === 'brands' ? 'active' : '' ?>"
               <?= ($activePage ?? '') === 'brands' ? 'aria-current="page"' : '' ?>>
                <i class="fas fa-palette" aria-hidden="true"></i>
                <span>Brand Manager</span>
            </a>
            <a href="/documents" class="nav-link <?= ($activePage ?? '') === 'documents' ? 'active' : '' ?>"
               <?= ($activePage ?? '') === 'documents' ? 'aria-current="page"' : '' ?>>
                <i class="fas fa-file-alt" aria-hidden="true"></i>
                <span>Documentos</span>
            </a>
        </div>

        <div class="nav-section">
            <span class="nav-section-title" id="nav-label-sistema">Sistema</span>
            <a href="/settings" class="nav-link <?= ($activePage ?? '') === 'settings' ? 'active' : '' ?>"
               <?= ($activePage ?? '') === 'settings' ? 'aria-current="page"' : '' ?>>
                <i class="fas fa-cog" aria-hidden="true"></i>
                <span>Configuración</span>
            </a>
        </div>
    </nav>

    <div class="sidebar-footer">
        <div class="ai-status" role="status" aria-label="Estado de Ollama">
            <span class="status-dot" id="ollama-status" aria-hidden="true"></span>
            <span class="status-text">Ollama</span>
        </div>
        <div class="footer-text">AMR Tech &copy; 2026</div>
    </div>
</aside>
