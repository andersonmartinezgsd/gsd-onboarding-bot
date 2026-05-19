<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <meta name="theme-color" content="#0A0E1A">
    <meta name="csrf-token" content="<?= htmlspecialchars(\AmrHub\Support\CsrfToken::get(), ENT_QUOTES, 'UTF-8') ?>">
    <title><?= htmlspecialchars($pageTitle ?? 'AMR Hub') ?> — AMR Hub</title>

    <!-- Google Fonts (preconnect para ambos dominios requeridos) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <!-- Iconos — SRI hash para garantizar integridad del asset de CDN (A08) -->
    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossorigin="anonymous"
          referrerpolicy="no-referrer">

    <!-- Design System AMR -->
    <link rel="stylesheet" href="/assets/css/design-system.css">
    <link rel="stylesheet" href="/assets/css/hub.css">

    <!-- Datos del usuario logueado para JS — sin datos sensibles -->
    <?php
    $__authUser = \AmrHub\Support\Auth::user();
    $__userJson = json_encode([
        'id'    => $__authUser['id']    ?? null,
        'name'  => $__authUser['name']  ?? '',
        'email' => $__authUser['email'] ?? '',
        'role'  => $__authUser['role']  ?? '',
    ], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE);
    ?>
    <script>window.__AMR_USER__ = <?= $__userJson ?>;</script>
</head>
<body>
    <!-- Skip to main content para accesibilidad de teclado -->
    <a href="#main-content" class="skip-link">Saltar al contenido principal</a>

    <div class="amr-layout">
        <!-- Sidebar -->
        <?= \AmrHub\Support\View::partial('sidebar', ['activePage' => $activePage ?? 'home']) ?>

        <!-- Main -->
        <main class="amr-main" id="main-content" role="main">
            <!-- Topbar -->
            <?= \AmrHub\Support\View::partial('topbar', ['pageTitle' => $pageTitle ?? 'Dashboard']) ?>

            <!-- Content -->
            <div class="amr-content">
                <?= $pageContent ?? '' ?>
            </div>
        </main>
    </div>

    <!-- Toast container (rol live region para lectores de pantalla) -->
    <div id="toast-container" class="amr-toast-container" role="status" aria-live="polite" aria-atomic="false"></div>

    <!-- Core JS (defer para no bloquear el render) -->
    <script src="/assets/js/core/apiClient.js" defer></script>
    <script src="/assets/js/core/toast.js" defer></script>
    <script src="/assets/js/core/state.js" defer></script>
</body>
</html>
