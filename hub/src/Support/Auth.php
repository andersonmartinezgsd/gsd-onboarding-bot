<?php

declare(strict_types=1);

namespace AmrHub\Support;

use AmrHub\Infrastructure\Http\Response;

/**
 * Autenticación de sesión — login, logout, verificación de acceso
 */
final class Auth
{
    private const SESSION_KEY  = 'auth_user';
    private const SESSION_ROLE = 'auth_role';

    /** Contraseña por defecto del administrador inicial */
    private const DEFAULT_PASSWORD = 'Admin2025!';

    /** Costo de bcrypt para password_hash */
    private const BCRYPT_COST = 12;

    // Constructor privado — solo métodos estáticos
    private function __construct() {}

    /**
     * Verifica si hay una sesión activa.
     */
    public static function check(): bool
    {
        return isset($_SESSION[self::SESSION_KEY]) && is_array($_SESSION[self::SESSION_KEY]);
    }

    /**
     * Retorna los datos del usuario logueado o null si no hay sesión.
     *
     * @return array{id: int, name: string, email: string, role: string}|null
     */
    public static function user(): ?array
    {
        if (!self::check()) {
            return null;
        }

        return $_SESSION[self::SESSION_KEY];
    }

    /**
     * Retorna el ID del usuario logueado o null.
     */
    public static function id(): ?int
    {
        return self::user()['id'] ?? null;
    }

    /**
     * Retorna el rol del usuario logueado o null.
     */
    public static function role(): ?string
    {
        return $_SESSION[self::SESSION_ROLE] ?? null;
    }

    /**
     * Verifica si el usuario logueado tiene rol de administrador.
     */
    public static function isAdmin(): bool
    {
        return self::role() === 'admin';
    }

    /**
     * Inicia sesión para el usuario dado.
     * Regenera el ID de sesión para prevenir session fixation.
     */
    public static function login(int $userId, string $name, string $email, string $role): void
    {
        // Prevenir session fixation — regenerar ID antes de escribir datos sensibles
        session_regenerate_id(true);

        $_SESSION[self::SESSION_KEY] = [
            'id'    => $userId,
            'name'  => $name,
            'email' => $email,
            'role'  => $role,
        ];
        $_SESSION[self::SESSION_ROLE] = $role;

        // Actualizar last_login_at en la base de datos
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare(
                "UPDATE users SET last_login_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
            );
            $stmt->execute([$userId]);
        } catch (\Throwable) {
            // No interrumpir el login si falla la actualización del timestamp
        }
    }

    /**
     * Cierra la sesión del usuario actual.
     */
    public static function logout(): void
    {
        // Limpiar datos de sesión
        $_SESSION = [];

        // Destruir la cookie de sesión
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        session_destroy();

        // Regenerar ID para la nueva sesión anónima
        session_start();
        session_regenerate_id(true);
    }

    /**
     * Verifica si el usuario está autenticado.
     * Si no lo está, retorna un Response de redirect a /login.
     * Si sí lo está, retorna null (continuar el dispatch normal).
     */
    public static function requireAuth(string $currentUri = ''): ?Response
    {
        if (self::check()) {
            return null;
        }

        // Construir la URL de retorno para redirigir después del login
        $redirectParam = $currentUri !== '' && $currentUri !== '/'
            ? '?redirect=' . urlencode($currentUri)
            : '';

        return Response::redirect('/login' . $redirectParam);
    }

    /**
     * Verifica si el usuario tiene rol de administrador.
     * Si no lo tiene, retorna un Response 403.
     * Si sí lo tiene, retorna null.
     */
    public static function requireAdmin(): ?Response
    {
        if (!self::check()) {
            return Response::redirect('/login');
        }

        if (!self::isAdmin()) {
            return Response::json(['error' => 'Acceso denegado — se requiere rol de administrador'], 403);
        }

        return null;
    }

    /**
     * Instala el usuario administrador por defecto si la tabla users está vacía.
     * Se llama en el bootstrap (public/index.php) después de session_start().
     */
    public static function install(): void
    {
        try {
            $db = Database::getConnection();

            // Verificar si ya existe algún usuario
            $count = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();

            if ((int) $count > 0) {
                return; // Ya hay usuarios — no hacer nada
            }

            // Generar hash bcrypt real con el costo definido
            $hash = password_hash(self::DEFAULT_PASSWORD, PASSWORD_BCRYPT, ['cost' => self::BCRYPT_COST]);

            $stmt = $db->prepare(
                "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
            );
            $stmt->execute(['Administrador', 'admin@amrtech.co', $hash, 'admin']);

            Logger::getInstance()->info('Usuario administrador instalado correctamente.');
        } catch (\Throwable $e) {
            // Loggear sin exponer detalles internos
            Logger::getInstance()->error('Error al instalar usuario admin: ' . $e->getMessage());
        }
    }
}
