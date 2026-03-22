<?php

declare(strict_types=1);

namespace AmrHub\Infrastructure\Http;

/**
 * Response builder — JSON y HTML
 */
final class Response
{
    private int $statusCode;
    private string $body;
    private array $headers;

    private function __construct(string $body, int $statusCode = 200, array $headers = [])
    {
        $this->body = $body;
        $this->statusCode = $statusCode;
        $this->headers = $headers;
    }

    public static function json(array $data, int $statusCode = 200): self
    {
        $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        // json_encode retorna false ante caracteres no serializables
        if ($encoded === false) {
            $encoded = json_encode(
                ['error' => 'Error al serializar la respuesta: ' . json_last_error_msg()],
                JSON_UNESCAPED_UNICODE
            );
            $statusCode = 500;
        }

        return new self(
            (string) $encoded,
            $statusCode,
            ['Content-Type' => 'application/json; charset=utf-8']
        );
    }

    public static function html(string $content, int $statusCode = 200): self
    {
        return new self(
            $content,
            $statusCode,
            ['Content-Type' => 'text/html; charset=utf-8']
        );
    }

    public static function redirect(string $url, int $statusCode = 302): self
    {
        return new self('', $statusCode, ['Location' => $url]);
    }

    public static function sse(string $event, mixed $data): void
    {
        echo "event: {$event}\n";
        echo "data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
        ob_flush();
        flush();
    }

    public function send(): void
    {
        http_response_code($this->statusCode);

        foreach ($this->headers as $name => $value) {
            header("{$name}: {$value}");
        }

        echo $this->body;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getBody(): string
    {
        return $this->body;
    }
}
