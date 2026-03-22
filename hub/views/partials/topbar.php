<header class="amr-topbar" role="banner">
    <div class="topbar-left">
        <button class="sidebar-toggle"
                aria-label="Abrir o cerrar menú lateral"
                aria-expanded="true"
                aria-controls="amr-sidebar"
                onclick="
                    const layout = document.querySelector('.amr-layout');
                    layout.classList.toggle('sidebar-collapsed');
                    this.setAttribute('aria-expanded', !layout.classList.contains('sidebar-collapsed'));
                ">
            <i class="fas fa-bars" aria-hidden="true"></i>
        </button>
        <h1 class="page-title"><?= htmlspecialchars($pageTitle ?? 'Dashboard') ?></h1>
    </div>
    <div class="topbar-right">
        <div class="topbar-search" role="search">
            <label for="topbar-search-input" class="sr-only">Buscar en AMR Hub</label>
            <i class="fas fa-search" aria-hidden="true"></i>
            <input type="search"
                   id="topbar-search-input"
                   placeholder="Buscar..."
                   class="search-input"
                   aria-label="Buscar en AMR Hub">
        </div>
        <div class="topbar-actions">
            <button class="action-btn" aria-label="Ver notificaciones">
                <i class="fas fa-bell" aria-hidden="true"></i>
            </button>
            <div class="user-avatar" role="img" aria-label="Avatar de usuario: Anderson Martinez">
                <span aria-hidden="true">AM</span>
            </div>
        </div>
    </div>
</header>
