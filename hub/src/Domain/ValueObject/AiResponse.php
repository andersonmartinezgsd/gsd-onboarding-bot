<?php

declare(strict_types=1);

namespace AmrHub\Domain\ValueObject;

/**
 * Value Object — respuesta normalizada de cualquier proveedor AI
 */
final readonly class AiResponse
{
    public function __construct(
        public string $content,
        public string $model,
        public string $provider,
        public int $tokensIn = 0,
        public int $tokensOut = 0,
        public int $latencyMs = 0,
        public bool $success = true,
        public ?string $error = null,
    ) {}

    public static function fromError(string $provider, string $error): self
    {
        return new self(
            content: '',
            model: '',
            provider: $provider,
            success: false,
            error: $error,
        );
    }

    public function toArray(): array
    {
        return [
            'content'    => $this->content,
            'model'      => $this->model,
            'provider'   => $this->provider,
            'tokens_in'  => $this->tokensIn,
            'tokens_out' => $this->tokensOut,
            'latency_ms' => $this->latencyMs,
            'success'    => $this->success,
            'error'      => $this->error,
        ];
    }
}
