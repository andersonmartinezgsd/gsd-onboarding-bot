<?php

declare(strict_types=1);

namespace AmrHub\Domain\ValueObject;

/**
 * Value Object — encapsula un request a cualquier proveedor AI
 */
final readonly class AiRequest
{
    /**
     * @param array<array{role: string, content: string}> $messages
     */
    public function __construct(
        public string $model,
        public array $messages,
        public float $temperature = 0.7,
        public int $maxTokens = 4096,
        public ?string $systemPrompt = null,
    ) {}

    public function toOllamaPayload(): array
    {
        $payload = [
            'model'   => $this->model,
            'stream'  => false,
            'options' => [
                'temperature'  => $this->temperature,
                'num_predict'  => $this->maxTokens,
            ],
        ];

        $messages = [];

        if ($this->systemPrompt !== null) {
            $messages[] = ['role' => 'system', 'content' => $this->systemPrompt];
        }

        foreach ($this->messages as $msg) {
            $messages[] = $msg;
        }

        $payload['messages'] = $messages;

        return $payload;
    }

    public function toOpenAiPayload(): array
    {
        $messages = [];

        if ($this->systemPrompt !== null) {
            $messages[] = ['role' => 'system', 'content' => $this->systemPrompt];
        }

        foreach ($this->messages as $msg) {
            $messages[] = $msg;
        }

        return [
            'model'       => $this->model,
            'messages'    => $messages,
            'temperature' => $this->temperature,
            'max_tokens'  => $this->maxTokens,
        ];
    }

    public function toAnthropicPayload(): array
    {
        $messages = [];

        foreach ($this->messages as $msg) {
            $messages[] = $msg;
        }

        $payload = [
            'model'      => $this->model,
            'messages'   => $messages,
            'max_tokens' => $this->maxTokens,
            'temperature' => $this->temperature,
        ];

        if ($this->systemPrompt !== null) {
            $payload['system'] = $this->systemPrompt;
        }

        return $payload;
    }
}
