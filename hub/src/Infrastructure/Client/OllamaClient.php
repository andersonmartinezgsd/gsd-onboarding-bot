<?php

declare(strict_types=1);

namespace AmrHub\Infrastructure\Client;

use AmrHub\Contract\AiProviderInterface;
use AmrHub\Domain\ValueObject\AiRequest;
use AmrHub\Domain\ValueObject\AiResponse;

/**
 * Cliente Ollama — modelos locales (gratis, sin límites)
 */
final class OllamaClient implements AiProviderInterface
{
    private readonly string $baseUrl;

    public function __construct(string $baseUrl = 'http://localhost:11434')
    {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    public function chat(AiRequest $request): AiResponse
    {
        $start = hrtime(true);

        $payload = $request->toOllamaPayload();
        $payload['stream'] = false;

        $result = $this->post('/api/chat', $payload);
        $latency = (int) ((hrtime(true) - $start) / 1_000_000);

        if ($result === null) {
            return AiResponse::fromError('ollama', 'No se pudo conectar con Ollama');
        }

        return new AiResponse(
            content: $result['message']['content'] ?? '',
            model: $result['model'] ?? $request->model,
            provider: 'ollama',
            tokensIn: $result['prompt_eval_count'] ?? 0,
            tokensOut: $result['eval_count'] ?? 0,
            latencyMs: $latency,
        );
    }

    public function chatStream(AiRequest $request): \Generator
    {
        $payload = $request->toOllamaPayload();
        $payload['stream'] = true;

        $ch = curl_init("{$this->baseUrl}/api/chat");
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_WRITEFUNCTION  => function ($ch, $data) use (&$buffer) {
                $buffer .= $data;
                return strlen($data);
            },
        ]);

        $buffer = '';
        curl_exec($ch);
        curl_close($ch);

        foreach (explode("\n", $buffer) as $line) {
            $line = trim($line);
            if (empty($line)) {
                continue;
            }
            $json = json_decode($line, true);
            if ($json !== null && isset($json['message']['content'])) {
                yield $json['message']['content'];
            }
        }
    }

    public function listModels(): array
    {
        $result = $this->get('/api/tags');
        if ($result === null) {
            return [];
        }

        $models = [];
        foreach ($result['models'] ?? [] as $model) {
            $models[] = [
                'id'   => $model['name'],
                'name' => $model['name'],
                'size' => $model['size'] ?? 0,
            ];
        }

        return $models;
    }

    public function isAvailable(): bool
    {
        $ch = curl_init("{$this->baseUrl}/api/tags");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 3,
            CURLOPT_CONNECTTIMEOUT => 2,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $response !== false && $httpCode === 200;
    }

    public function getName(): string
    {
        return 'ollama';
    }

    private function post(string $endpoint, array $data): ?array
    {
        $ch = curl_init("{$this->baseUrl}{$endpoint}");
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 300,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false || $httpCode >= 400) {
            return null;
        }

        return json_decode($response, true);
    }

    private function get(string $endpoint): ?array
    {
        $ch = curl_init("{$this->baseUrl}{$endpoint}");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false || $httpCode >= 400) {
            return null;
        }

        return json_decode($response, true);
    }
}
