<?php

declare(strict_types=1);

namespace AmrHub\Contract;

use AmrHub\Domain\ValueObject\AiRequest;
use AmrHub\Domain\ValueObject\AiResponse;

/**
 * Strategy Pattern — todos los proveedores AI implementan esta interfaz
 */
interface AiProviderInterface
{
    /**
     * Envía un prompt y retorna la respuesta del modelo
     */
    public function chat(AiRequest $request): AiResponse;

    /**
     * Stream de respuesta (para SSE)
     * @return \Generator<string>
     */
    public function chatStream(AiRequest $request): \Generator;

    /**
     * Lista modelos disponibles en este proveedor
     * @return array<array{id: string, name: string}>
     */
    public function listModels(): array;

    /**
     * Verifica si el proveedor está disponible
     */
    public function isAvailable(): bool;

    /**
     * Nombre identificador del proveedor
     */
    public function getName(): string;
}
