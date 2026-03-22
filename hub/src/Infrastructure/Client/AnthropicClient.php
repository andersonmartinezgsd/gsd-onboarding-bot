<?php

declare(strict_types=1);

namespace AmrHub\Infrastructure\Client;

use AmrHub\Contract\AiProviderInterface;
use AmrHub\Domain\ValueObject\AiRequest;
use AmrHub\Domain\ValueObject\AiResponse;

/**
 * Cliente Anthropic — Claude Opus, Sonnet, Haiku
 */
final class AnthropicClient implements AiProviderInterface
{
    private const BASE_URL = 'https://api.anthropic.com/v1';
    private const API_VERSION = '2023-06-01';

    public function __construct(
        private readonly string $apiKey = '',
    ) {}

    public function chat(AiRequest $request): AiResponse
    {
        if (empty($this->apiKey)) {
            return AiResponse::fromError('anthropic', 'API key de Anthropic no configurada');
        }

        $start = hrtime(true);
        $payload = $request->toAnthropicPayload();

        $result = $this->post('/messages', $payload);
        $latency = (int) ((hrtime(true) - $start) / 1_000_000);

        if ($result === null) {
            return AiResponse::fromError('anthropic', 'Error de conexión con Anthropic');
        }

        if (isset($result['error'])) {
            return AiResponse::fromError('anthropic', $result['error']['message'] ?? 'Error desconocido');
        }

        $content = '';
        foreach ($result['content'] ?? [] as $block) {
            if ($block['type'] === 'text') {
                $content .= $block['text'];
            }
        }

        return new AiResponse(
            content: $content,
            model: $result['model'] ?? $request->model,
            provider: 'anthropic',
            tokensIn: $result['usage']['input_tokens'] ?? 0,
            tokensOut: $result['usage']['output_tokens'] ?? 0,
            latencyMs: $latency,
        );
    }

    public function chatStream(AiRequest $request): \Generator
    {
        $payload = $request->toAnthropicPayload();
        $payload['stream'] = true;

        $ch = curl_init(self::BASE_URL . '/messages');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                "x-api-key: {$this->apiKey}",
                'anthropic-version: ' . self::API_VERSION,
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 120,
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        // Si curl falló $response es false — no iterar
        if ($response === false || !is_string($response)) {
            return;
        }

        foreach (explode("\n", $response) as $line) {
            $line = trim($line);
            if (str_starts_with($line, 'data: ')) {
                $json = json_decode(substr($line, 6), true);
                if (($json['type'] ?? '') === 'content_block_delta') {
                    yield $json['delta']['text'] ?? '';
                }
            }
        }
    }

    public function listModels(): array
    {
        return [
            ['id' => 'claude-opus-4-20250514', 'name' => 'Claude Opus 4'],
            ['id' => 'claude-sonnet-4-20250514', 'name' => 'Claude Sonnet 4'],
            ['id' => 'claude-haiku-3-20240307', 'name' => 'Claude Haiku 3'],
        ];
    }

    public function isAvailable(): bool
    {
        return !empty($this->apiKey);
    }

    public function getName(): string
    {
        return 'anthropic';
    }

    private function post(string $endpoint, array $data): ?array
    {
        $ch = curl_init(self::BASE_URL . $endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                "x-api-key: {$this->apiKey}",
                'anthropic-version: ' . self::API_VERSION,
            ],
            CURLOPT_TIMEOUT        => 120,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false || $httpCode >= 500) {
            return null;
        }

        return json_decode($response, true);
    }
}
