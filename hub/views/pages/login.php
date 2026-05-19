<?php
/**
 * Vista de login — autenticación del sistema AMR Hub
 * Layout: auth
 */
$csrfToken = \AmrHub\Support\CsrfToken::get();
?>

<style>
    /* ── Formulario de login ────────────────────────────────── */
    .login-heading {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: var(--weight-semibold);
        color: var(--amr-text-primary);
        margin-bottom: var(--space-2);
        text-align: center;
    }

    .login-subheading {
        font-size: var(--text-sm);
        color: var(--amr-text-muted);
        text-align: center;
        margin-bottom: var(--space-8);
    }

    /* ── Campo de formulario con icono ──────────────────────── */
    .login-field {
        margin-bottom: var(--space-5);
    }

    .login-label {
        display: block;
        font-size: var(--text-sm);
        font-weight: var(--weight-medium);
        color: var(--amr-text-secondary);
        margin-bottom: var(--space-2);
    }

    .login-input-wrap {
        position: relative;
    }

    .login-input-icon {
        position: absolute;
        left: var(--space-4);
        top: 50%;
        transform: translateY(-50%);
        color: var(--amr-text-muted);
        font-size: var(--text-sm);
        pointer-events: none;
        transition: color var(--transition-fast);
    }

    .login-input {
        width: 100%;
        background: var(--amr-bg-elevated);
        border: 1px solid var(--amr-border);
        border-radius: var(--radius-md);
        padding: var(--space-3) var(--space-4) var(--space-3) var(--space-10);
        font-size: var(--text-base);
        color: var(--amr-text-primary);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        outline: none;
    }

    .login-input::placeholder {
        color: var(--amr-text-muted);
    }

    .login-input:focus {
        border-color: var(--amr-primary);
        box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.10);
    }

    .login-input:focus + .login-input-icon,
    .login-input-wrap:focus-within .login-input-icon {
        color: var(--amr-primary);
    }

    .login-input.input-error {
        border-color: var(--amr-error);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.10);
    }

    /* ── Toggle de contraseña ───────────────────────────────── */
    .password-toggle {
        position: absolute;
        right: var(--space-4);
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--amr-text-muted);
        cursor: pointer;
        padding: var(--space-1);
        font-size: var(--text-sm);
        transition: color var(--transition-fast);
        line-height: 1;
    }

    .password-toggle:hover {
        color: var(--amr-text-secondary);
    }

    .login-input.has-toggle {
        padding-right: var(--space-10);
    }

    /* ── Alerta de error ────────────────────────────────────── */
    .login-alert {
        display: flex;
        align-items: flex-start;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        background: var(--amr-error-bg);
        border: 1px solid var(--amr-error-border);
        border-radius: var(--radius-md);
        color: var(--amr-error);
        font-size: var(--text-sm);
        margin-bottom: var(--space-6);
    }

    .login-alert i {
        flex-shrink: 0;
        margin-top: 2px;
    }

    /* ── Botón de submit ────────────────────────────────────── */
    .login-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-6);
        height: 46px;
        background: var(--amr-gradient-brand);
        color: #fff;
        border: none;
        border-radius: var(--radius-md);
        font-family: var(--font-sans);
        font-size: var(--text-base);
        font-weight: var(--weight-semibold);
        cursor: pointer;
        transition: opacity var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
        margin-top: var(--space-2);
        position: relative;
        overflow: hidden;
    }

    .login-btn:hover:not(:disabled) {
        opacity: 0.92;
        box-shadow: var(--shadow-glow);
        transform: translateY(-1px);
    }

    .login-btn:active:not(:disabled) {
        transform: translateY(0);
    }

    .login-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Spinner dentro del botón */
    .login-btn .btn-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 600ms linear infinite;
        display: none;
    }

    .login-btn.loading .btn-text { display: none; }
    .login-btn.loading .btn-spinner { display: block; }

    @keyframes spin { to { transform: rotate(360deg); } }
</style>

<h2 class="login-heading">Bienvenido de vuelta</h2>
<p class="login-subheading">Ingresa tus credenciales para continuar</p>

<!-- Mensaje de error del servidor (query string ?error=1) -->
<?php if (!empty($error)): ?>
    <div class="login-alert" role="alert" id="server-error">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        <span><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></span>
    </div>
<?php endif; ?>

<!-- Alerta dinámica de error (fetch) — oculta por defecto -->
<div class="login-alert" role="alert" id="login-error" style="display:none;" aria-live="polite">
    <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
    <span id="login-error-msg"></span>
</div>

<!-- Formulario de login -->
<form id="login-form" novalidate>
    <!-- Email -->
    <div class="login-field">
        <label class="login-label" for="login-email">Correo electrónico</label>
        <div class="login-input-wrap">
            <input
                type="email"
                id="login-email"
                name="email"
                class="login-input"
                placeholder="admin@amrtech.co"
                autocomplete="email"
                required
                aria-required="true"
                aria-describedby="login-error">
            <i class="fas fa-envelope login-input-icon" aria-hidden="true"></i>
        </div>
    </div>

    <!-- Contraseña -->
    <div class="login-field">
        <label class="login-label" for="login-password">Contraseña</label>
        <div class="login-input-wrap">
            <input
                type="password"
                id="login-password"
                name="password"
                class="login-input has-toggle"
                placeholder="••••••••••"
                autocomplete="current-password"
                required
                aria-required="true">
            <i class="fas fa-lock login-input-icon" aria-hidden="true"></i>
            <button
                type="button"
                class="password-toggle"
                id="password-toggle"
                aria-label="Mostrar u ocultar contraseña"
                tabindex="0">
                <i class="fas fa-eye" id="toggle-icon" aria-hidden="true"></i>
            </button>
        </div>
    </div>

    <!-- Botón de submit -->
    <button type="submit" class="login-btn" id="login-btn">
        <span class="btn-text">
            <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
            Iniciar sesión
        </span>
        <span class="btn-spinner" aria-hidden="true"></span>
    </button>
</form>

<script>
(function () {
    'use strict';

    const form        = document.getElementById('login-form');
    const emailInput  = document.getElementById('login-email');
    const passInput   = document.getElementById('login-password');
    const toggleBtn   = document.getElementById('password-toggle');
    const toggleIcon  = document.getElementById('toggle-icon');
    const submitBtn   = document.getElementById('login-btn');
    const errorBox    = document.getElementById('login-error');
    const errorMsg    = document.getElementById('login-error-msg');

    // ── Toggle mostrar/ocultar contraseña ───────────────────
    toggleBtn.addEventListener('click', () => {
        const isPassword = passInput.type === 'password';
        passInput.type   = isPassword ? 'text' : 'password';
        toggleIcon.classList.toggle('fa-eye',      !isPassword);
        toggleIcon.classList.toggle('fa-eye-slash',  isPassword);
        toggleBtn.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });

    // ── Mostrar mensaje de error ─────────────────────────────
    function showError(message) {
        errorMsg.textContent = message;
        errorBox.style.display = 'flex';
        emailInput.classList.add('input-error');
        passInput.classList.add('input-error');
        // Scroll suave hacia el error
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function clearError() {
        errorBox.style.display = 'none';
        errorMsg.textContent   = '';
        emailInput.classList.remove('input-error');
        passInput.classList.remove('input-error');
    }

    // ── Estado de carga del botón ────────────────────────────
    function setLoading(loading) {
        submitBtn.disabled = loading;
        submitBtn.classList.toggle('loading', loading);
    }

    // ── Submit via fetch ─────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const email    = emailInput.value.trim();
        const password = passInput.value;

        // Validación mínima en cliente
        if (!email || !password) {
            showError('Por favor completa todos los campos.');
            return;
        }

        setLoading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

            const response = await fetch('/login', {
                method:  'POST',
                headers: {
                    'Content-Type':     'application/json',
                    'Accept':           'application/json',
                    'X-CSRF-Token':     csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Login exitoso — redirigir al dashboard
                window.location.href = data.redirect ?? '/';
            } else {
                const msg = data.error ?? 'Credenciales incorrectas. Verifica tu email y contraseña.';
                showError(msg);
                setLoading(false);
                // Limpiar contraseña por seguridad
                passInput.value = '';
                passInput.focus();
            }
        } catch (err) {
            showError('Error de conexión. Verifica tu red e intenta de nuevo.');
            setLoading(false);
        }
    });

    // Limpiar errores al escribir
    emailInput.addEventListener('input', clearError);
    passInput.addEventListener('input',  clearError);

    // Focus inicial en el campo email
    emailInput.focus();
})();
</script>
