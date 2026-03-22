<?php

declare(strict_types=1);

namespace AmrHub\Infrastructure\Http;

/**
 * Wrapper de request HTTP — nunca acceder $_GET/$_POST directamente
 */
final class Request
{
    private readonly array $query;
    private readonly array $body;
    private readonly array $files;
    private readonly array $server;
    private readonly array $headers;

    public function __construct()
    {
        $this->query = $this->sanitizeArray($_GET);
        $this->body = $this->sanitizeArray($_POST);
        $this->files = $_FILES;
        $this->server = $_SERVER;
        $this->headers = $this->parseHeaders();
    }

    public function method(): string
    {
        return strtoupper($this->server['REQUEST_METHOD'] ?? 'GET');
    }

    public function uri(): string
    {
        $uri = $this->server['REQUEST_URI'] ?? '/';
        $basePath = dirname($this->server['SCRIPT_NAME'] ?? '');

        if ($basePath !== '/' && $basePath !== '\\') {
            $uri = substr($uri, strlen($basePath));
        }

        $uri = strtok($uri, '?');
        return $uri ?: '/';
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $this->query[$key] ?? $default;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    public function all(): array
    {
        return array_merge($this->query, $this->body);
    }

    public function jsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return [];
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function file(string $key): ?array
    {
        return $this->files[$key] ?? null;
    }

    public function files(string $key): array
    {
        $file = $this->files[$key] ?? null;
        if ($file === null) {
            return [];
        }

        // Normalizar array de múltiples archivos
        if (is_array($file['name'])) {
            $normalized = [];
            foreach ($file['name'] as $i => $name) {
                $normalized[] = [
                    'name'     => $name,
                    'type'     => $file['type'][$i],
                    'tmp_name' => $file['tmp_name'][$i],
                    'error'    => $file['error'][$i],
                    'size'     => $file['size'][$i],
                ];
            }
            return $normalized;
        }

        return [$file];
    }

    public function header(string $name): ?string
    {
        $key = strtolower($name);
        return $this->headers[$key] ?? null;
    }

    public function isAjax(): bool
    {
        return $this->header('x-requested-with') === 'XMLHttpRequest'
            || str_contains($this->header('accept') ?? '', 'application/json');
    }

    public function bearerToken(): ?string
    {
        $auth = $this->header('authorization');
        if ($auth !== null && str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }
        return null;
    }

    private function sanitizeArray(array $data): array
    {
        $sanitized = [];
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitizeArray($value);
            } else {
                $sanitized[$key] = htmlspecialchars(trim((string) $value), ENT_QUOTES, 'UTF-8');
            }
        }
        return $sanitized;
    }

    private function parseHeaders(): array
    {
        $headers = [];
        foreach ($this->server as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $name = strtolower(str_replace('_', '-', substr($key, 5)));
                $headers[$name] = $value;
            }
        }

        if (isset($this->server['CONTENT_TYPE'])) {
            $headers['content-type'] = $this->server['CONTENT_TYPE'];
        }

        return $headers;
    }
}
