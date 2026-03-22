<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle ?? 'AMR Hub') ?> — AMR Hub</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <!-- Iconos -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- Design System AMR -->
    <link rel="stylesheet" href="/assets/css/design-system.css">
    <link rel="stylesheet" href="/assets/css/hub.css">
</head>
<body>
    <div class="amr-layout">
        <!-- Sidebar -->
        <?= \AmrHub\Support\View::partial('sidebar', ['activePage' => $activePage ?? 'home']) ?>

        <!-- Main -->
        <main class="amr-main">
            <!-- Topbar -->
            <?= \AmrHub\Support\View::partial('topbar', ['pageTitle' => $pageTitle ?? 'Dashboard']) ?>

            <!-- Content -->
            <div class="amr-content">
                <?= $pageContent ?? '' ?>
            </div>
        </main>
    </div>

    <!-- Toast container -->
    <div id="toast-container" class="amr-toast-container"></div>

    <!-- Core JS -->
    <script src="/assets/js/core/apiClient.js"></script>
    <script src="/assets/js/core/toast.js"></script>
    <script src="/assets/js/core/state.js"></script>
</body>
</html>
