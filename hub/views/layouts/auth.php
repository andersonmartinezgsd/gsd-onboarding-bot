<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0A0E1A">
    <meta name="robots" content="noindex, nofollow">
    <meta name="csrf-token" content="<?= htmlspecialchars(\AmrHub\Support\CsrfToken::get(), ENT_QUOTES, 'UTF-8') ?>">
    <title><?= htmlspecialchars($pageTitle ?? 'Acceso') ?> — AMR Hub</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossorigin="anonymous"
          referrerpolicy="no-referrer">

    <!-- Design System AMR -->
    <link rel="stylesheet" href="/assets/css/design-system.css">
    <link rel="stylesheet" href="/assets/css/hub.css">

    <style>
        /* ── Layout de autenticación ────────────────────────────── */
        .auth-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--amr-bg-base);
            position: relative;
            overflow: hidden;
            padding: var(--space-6);
        }

        /* Glow decorativo de fondo */
        .auth-page::before {
            content: '';
            position: absolute;
            top: -30%;
            left: 50%;
            transform: translateX(-50%);
            width: 800px;
            height: 600px;
            background: radial-gradient(ellipse at center,
                rgba(0, 212, 255, 0.07) 0%,
                rgba(124, 58, 237, 0.05) 40%,
                transparent 70%);
            pointer-events: none;
        }

        /* Puntos decorativos de cuadrícula */
        .auth-page::after {
            content: '';
            position: absolute;
            inset: 0;
            background-image: radial-gradient(circle, rgba(255,255,255,.03) 1px, transparent 1px);
            background-size: 32px 32px;
            pointer-events: none;
        }

        /* ── Card de autenticación ──────────────────────────────── */
        .auth-card {
            position: relative;
            z-index: var(--z-base);
            width: 100%;
            max-width: 420px;
            background: rgba(17, 24, 39, 0.85);
            border: 1px solid rgba(0, 212, 255, 0.12);
            border-radius: var(--radius-xl);
            padding: var(--space-10) var(--space-8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow:
                0 8px 40px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        /* Línea de acento superior */
        .auth-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: var(--amr-gradient-brand);
            border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        }

        /* ── Logo / Marca ───────────────────────────────────────── */
        .auth-logo {
            text-align: center;
            margin-bottom: var(--space-8);
        }

        .auth-logo-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            background: var(--amr-gradient-brand);
            border-radius: var(--radius-lg);
            font-size: 28px;
            margin-bottom: var(--space-4);
            box-shadow: var(--shadow-glow);
        }

        .auth-logo-title {
            font-family: var(--font-display);
            font-size: var(--text-2xl);
            font-weight: var(--weight-bold);
            background: var(--amr-gradient-brand);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.2;
        }

        .auth-logo-subtitle {
            font-size: var(--text-sm);
            color: var(--amr-text-muted);
            margin-top: var(--space-1);
        }

        /* ── Footer de la card ──────────────────────────────────── */
        .auth-footer {
            text-align: center;
            margin-top: var(--space-8);
            padding-top: var(--space-5);
            border-top: 1px solid var(--amr-border);
            font-size: var(--text-xs);
            color: var(--amr-text-muted);
        }
    </style>
</head>
<body>
    <div class="auth-page">
        <div class="auth-card">
            <!-- Logo -->
            <div class="auth-logo">
                <div class="auth-logo-icon" aria-hidden="true">⚡</div>
                <div class="auth-logo-title">AMR Hub</div>
                <div class="auth-logo-subtitle">Panel de control inteligente</div>
            </div>

            <!-- Contenido de la página -->
            <?= $pageContent ?? '' ?>

            <!-- Footer -->
            <div class="auth-footer">
                v1.0 &middot; AMR Tech &copy; <?= date('Y') ?>
            </div>
        </div>
    </div>
</body>
</html>
