<header class="amr-topbar">
    <div class="topbar-left">
        <button class="sidebar-toggle" onclick="document.querySelector('.amr-layout').classList.toggle('sidebar-collapsed')">
            <i class="fas fa-bars"></i>
        </button>
        <h1 class="page-title"><?= htmlspecialchars($pageTitle ?? 'Dashboard') ?></h1>
    </div>
    <div class="topbar-right">
        <div class="topbar-search">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Buscar..." class="search-input">
        </div>
        <div class="topbar-actions">
            <button class="action-btn" title="Notificaciones">
                <i class="fas fa-bell"></i>
            </button>
            <div class="user-avatar">
                <span>AM</span>
            </div>
        </div>
    </div>
</header>
