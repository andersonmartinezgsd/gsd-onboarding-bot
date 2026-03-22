<?php

declare(strict_types=1);

namespace AmrHub\Support;

/**
 * Protección CSRF — generación y validación de tokens
 */
final class CsrfToken
{
    private const TOKEN_KEY = 'csrf_token';

    public static function generate(): string
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $token = bin2hex(random_bytes(32));
        $_SESSION[self::TOKEN_KEY] = $token;

        return $token;
    }

    public static function get(): string
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        return $_SESSION[self::TOKEN_KEY] ?? self::generate();
    }

    public static function validate(string $token): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $stored = $_SESSION[self::TOKEN_KEY] ?? '';

        return hash_equals($stored, $token);
    }

    public static function htmlInput(): string
    {
        $token = self::get();
        return '<input type="hidden" name="_csrf" value="' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
    }
}
