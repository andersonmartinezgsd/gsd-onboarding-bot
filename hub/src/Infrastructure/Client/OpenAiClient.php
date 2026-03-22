<?php

declare(strict_types=1);

namespace AmrHub\Infrastructure\Client;

use AmrHub\Contract\AiProviderInterface;
use AmrHub\Domain\ValueObject\AiRequest;
use AmrHub\Domain\ValueObject\AiResponse;

/**
 * Cliente OpenAI — GPT-4o, GPT-5, etc.
 */
final class OpenAiClient implements AiProviderInterface
{
    private const BASE_URL = 'https://api.openai.com/v1';

    public function __construct(
        private readonly string $apiKey = '',
    ) {}

    public function chat(AiRequest $request): AiResponse
    {
        if (empty($this->apiKey)) {
            return AiResponse::fromError('openai', 'API key de OpenAI no configurada');
        }

        $start = hrtime(true);
        $payload = $request->toOpenAiPayload();

        $result = $this->post('/chat/completions', $payload);
        $latency = (int) ((hrtime(true) - $start) / 1_000_000);

        if ($result === null) {
            return AiResponse::fromError('openai', 'Error de conexión con OpenAI');
        }

        if (isset($result['error'])) {
            return AiResponse::fromError('openai', $result['error']['message'] ?? 'Error desconocido');
        }

        return new AiResponse(
            content: $result['choices'][0]['message']['content'] ?? '',
            model: $result['model'] ?? $request->model,
            provider: 'openai',
            tokensIn: $result['usage']['prompt_tokens'] ?? 0,
            tokensOut: $result['usage']['completion_tokens'] ?? 0,
            latencyMs: $latency,
        );
    }

    public function chatStream(AiRequest $request): \Generator
    {
        $payload = $request->toOpenAiPayload();
        $payload['stream'] = true;

        $ch = curl_init(self::BASE_URL . '/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                "Authorization: Bearer {$this->apiKey}",
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 120,
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        foreach (explode("\n", $response) as $line) {
            if (str_starts_with($line, 'data: ') && $line !== 'data: [DONE]') {
                $json = json_decode(substr($line, 6), true);
                $delta = $json['choices'][0]['delta']['content'] ?? '';
                if ($delta !== '') {
                    yield $delta;
                }
            }
        }
    }

    public function listModels(): array
    {
        if (empty($this->apiKey)) {
            return self::fallbackModels();
        }

        $result = $this->get('/models');
        if ($result === null || !isset($result['data'])) {
            return self::fallbackModels();
        }

        // Prefijos de modelos de chat válidos de OpenAI
        $chatPrefixes = ['gpt-', 'o1', 'o3', 'o4', 'chatgpt-'];

        $models = [];
        $seen = [];

        foreach ($result['data'] as $model) {
            $id = $model['id'];

            // Filtrar solo modelos de chat
            $isChat = false;
            foreach ($chatPrefixes as $prefix) {
                if (str_starts_with($id, $prefix)) {
                    $isChat = true;
                    break;
                }
            }

            if (!$isChat) {
                continue;
            }

            // Evitar duplicados y modelos internos
            if (isset($seen[$id]) || str_contains($id, 'instruct') || str_contains($id, 'realtime') || str_contains($id, 'audio')) {
                continue;
            }

            $seen[$id] = true;
            $models[] = [
                'id'   => $id,
                'name' => $id,
            ];
        }

        // Ordenar: modelos más recientes primero
        usort($models, fn($a, $b) => strcmp($b['id'], $a['id']));

        return !empty($models) ? $models : self::fallbackModels();
    }

    /**
     * Lista de modelos conocidos como fallback si la API no responde
     */
    private static function fallbackModels(): array
    {
        return [
            ['id' => 'gpt-4.1', 'name' => 'GPT-4.1'],
            ['id' => 'gpt-4.1-mini', 'name' => 'GPT-4.1 Mini'],
            ['id' => 'gpt-4.1-nano', 'name' => 'GPT-4.1 Nano'],
            ['id' => 'gpt-4o', 'name' => 'GPT-4o'],
            ['id' => 'gpt-4o-mini', 'name' => 'GPT-4o Mini'],
            ['id' => 'o3-mini', 'name' => 'o3-mini'],
            ['id' => 'gpt-4-turbo', 'name' => 'GPT-4 Turbo'],
            ['id' => 'gpt-3.5-turbo', 'name' => 'GPT-3.5 Turbo'],
        ];
    }

    public function isAvailable(): bool
    {
        return !empty($this->apiKey);
    }

    public function getName(): string
    {
        return 'openai';
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
                "Authorization: Bearer {$this->apiKey}",
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

    private function get(string $endpoint): ?array
    {
        $ch = curl_init(self::BASE_URL . $endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                "Authorization: Bearer {$this->apiKey}",
            ],
            CURLOPT_TIMEOUT        => 10,
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        if ($response === false) {
            return null;
        }

        return json_decode($response, true);
    }
}
