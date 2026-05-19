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
            <?php
            $__topbarUser = \AmrHub\Support\Auth::user();
            $__topbarInitial = $__topbarUser !== null
                ? mb_strtoupper(mb_substr((string) $__topbarUser['name'], 0, 1, 'UTF-8'), 'UTF-8')
                : 'U';
            $__topbarName = htmlspecialchars((string) ($__topbarUser['name'] ?? 'Usuario'), ENT_QUOTES, 'UTF-8');
            ?>
            <div class="user-avatar" role="img" aria-label="Avatar de usuario: <?= $__topbarName ?>">
                <span aria-hidden="true"><?= $__topbarInitial ?></span>
            </div>
            <!-- Botón de logout -->
            <button
                class="action-btn logout-btn"
                id="topbar-logout-btn"
                aria-label="Cerrar sesión"
                title="Cerrar sesión">
                <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
            </button>
        </div>
    </div>
</header>

<script>
(function () {
    'use strict';

    const logoutBtn = document.getElementById('topbar-logout-btn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async () => {
        if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) return;

        logoutBtn.disabled = true;

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

            const response = await fetch('/logout', {
                method:  'POST',
                headers: {
                    'X-CSRF-Token':     csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept':           'application/json',
                },
            });

            // Redirigir siempre al login, independientemente de la respuesta
            window.location.href = '/login';
        } catch (err) {
            // Forzar redirección incluso si hay error de red
            window.location.href = '/login';
        }
    });
})();
</script>
