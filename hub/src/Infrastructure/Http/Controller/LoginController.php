<?php

declare(strict_types=1);

namespace AmrHub\Infrastructure\Http\Controller;

use AmrHub\Infrastructure\Http\Request;
use AmrHub\Infrastructure\Http\Response;
use AmrHub\Support\Auth;
use AmrHub\Support\Database;
use AmrHub\Support\View;

/**
 * Controlador de autenticación — login y logout
 */
final class LoginController
{
    /** Máximo intentos fallidos en la ventana de tiempo */
    private const MAX_ATTEMPTS  = 5;

    /** Ventana de rate limiting en segundos (15 minutos) */
    private const RATE_WINDOW   = 900;

    /** Clave de sesión para el rate limiter */
    private const RATE_KEY      = 'rl_login';

    /**
     * GET /login — muestra el formulario de login.
     * Si ya hay sesión activa, redirige al dashboard.
     */
    public function showLogin(Request $request, array $params): Response
    {
        // Usuario ya autenticado — redirigir al inicio
        if (Auth::check()) {
            return Response::redirect('/');
        }

        $html = View::render('pages.login', [
            'pageTitle' => 'Iniciar sesión',
            'error'     => $request->query('error') === '1' ? 'Credenciales incorrectas. Verifica tu email y contraseña.' : null,
        ], 'auth');

        return Response::html($html);
    }

    /**
     * POST /login — procesa las credenciales y crea la sesión.
     */
    public function processLogin(Request $request, array $params): Response
    {
        // Detectar si la petición es AJAX / fetch
        $isAjax = $request->isAjax();

        // ── Rate limiting ────────────────────────────────────────────────
        if ($this->isRateLimited()) {
            $message = 'Demasiados intentos fallidos. Espera 15 minutos e intenta de nuevo.';

            if ($isAjax) {
                return Response::json(['error' => $message], 429);
            }

            return Response::redirect('/login?error=1');
        }

        // ── Leer credenciales ────────────────────────────────────────────
        // Soporta tanto JSON (fetch) como form submit normal
        if ($isAjax) {
            $body  = $request->jsonBody();
            $email = trim((string) ($body['email'] ?? ''));
            $password = (string) ($body['password'] ?? '');
        } else {
            $email    = trim((string) $request->input('email', ''));
            $password = (string) $request->input('password', '');
        }

        // ── Validación básica ────────────────────────────────────────────
        if ($email === '' || $password === '') {
            return $this->failResponse($isAjax, 'Los campos email y contraseña son obligatorios.');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->failResponse($isAjax, 'Credenciales inválidas.');
        }

        // ── Buscar usuario en DB ─────────────────────────────────────────
        try {
            $db   = Database::getConnection();
            $stmt = $db->prepare(
                "SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1"
            );
            $stmt->execute([$email]);
            $user = $stmt->fetch();
        } catch (\Throwable) {
            return $this->failResponse($isAjax, 'Error interno. Intenta de nuevo.');
        }

        // ── Verificar existencia y password ─────────────────────────────
        // Usamos una comparación siempre (usuario vacío) para evitar timing attack
        $dummyHash = '$2y$12$invalidhashpadding000000000000000000000000000000000000000';
        $hash      = is_array($user) ? (string) $user['password_hash'] : $dummyHash;

        if (!password_verify($password, $hash) || !is_array($user)) {
            $this->recordFailedAttempt();
            // Respuesta genérica — no revelar si el usuario existe o no
            return $this->failResponse($isAjax, 'Credenciales incorrectas. Verifica tu email y contraseña.');
        }

        // ── Verificar cuenta activa ──────────────────────────────────────
        if ((int) $user['is_active'] !== 1) {
            $this->recordFailedAttempt();
            return $this->failResponse($isAjax, 'Tu cuenta está desactivada. Contacta al administrador.');
        }

        // ── Login exitoso ────────────────────────────────────────────────
        $this->clearRateLimit();

        Auth::login(
            (int)   $user['id'],
            (string) $user['name'],
            (string) $user['email'],
            (string) $user['role']
        );

        if ($isAjax) {
            return Response::json(['success' => true, 'redirect' => '/']);
        }

        return Response::redirect('/');
    }

    /**
     * POST /logout — destruye la sesión y redirige al login.
     */
    public function logout(Request $request, array $params): Response
    {
        Auth::logout();
        return Response::redirect('/login');
    }

    // ── Helpers privados ─────────────────────────────────────────────────

    /**
     * Verifica si el IP/sesión actual excedió el límite de intentos.
     */
    private function isRateLimited(): bool
    {
        $data = $_SESSION[self::RATE_KEY] ?? null;

        if (!is_array($data)) {
            return false;
        }

        // Limpiar ventana expirada
        if ((int) $data['window_start'] < (time() - self::RATE_WINDOW)) {
            unset($_SESSION[self::RATE_KEY]);
            return false;
        }

        return (int) $data['attempts'] >= self::MAX_ATTEMPTS;
    }

    /**
     * Registra un intento fallido en la sesión.
     */
    private function recordFailedAttempt(): void
    {
        if (!isset($_SESSION[self::RATE_KEY])) {
            $_SESSION[self::RATE_KEY] = [
                'attempts'     => 0,
                'window_start' => time(),
            ];
        }

        $_SESSION[self::RATE_KEY]['attempts'] = (int) $_SESSION[self::RATE_KEY]['attempts'] + 1;
    }

    /**
     * Limpia el contador de intentos fallidos tras un login exitoso.
     */
    private function clearRateLimit(): void
    {
        unset($_SESSION[self::RATE_KEY]);
    }

    /**
     * Construye la respuesta de error según el tipo de petición.
     */
    private function failResponse(bool $isAjax, string $message): Response
    {
        if ($isAjax) {
            return Response::json(['error' => $message], 401);
        }

        return Response::redirect('/login?error=1');
    }
}
