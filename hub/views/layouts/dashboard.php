<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0A0E1A">
    <title><?= htmlspecialchars($pageTitle ?? 'AMR Hub') ?> — AMR Hub</title>

    <!-- Google Fonts (preconnect para ambos dominios requeridos) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <!-- Iconos -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- Design System AMR -->
    <link rel="stylesheet" href="/assets/css/design-system.css">
    <link rel="stylesheet" href="/assets/css/hub.css">
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
