<?php

declare(strict_types=1);

namespace AmrHub\Application\Service;

use AmrHub\Contract\AiProviderInterface;
use AmrHub\Domain\ValueObject\AiRequest;
use AmrHub\Domain\ValueObject\AiResponse;

/**
 * Selecciona el proveedor AI correcto basado en el modelo solicitado
 * Implementa fallback automático entre proveedores
 */
final class AiRouter
{
    /** @var array<string, AiProviderInterface> */
    private array $providers = [];

    /** @var string[] Orden de fallback */
    private array $fallbackOrder = ['ollama', 'openai', 'anthropic'];

    public function registerProvider(AiProviderInterface $provider): void
    {
        $this->providers[$provider->getName()] = $provider;
    }

    public function chat(AiRequest $request, ?string $preferredProvider = null): AiResponse
    {
        // Si se especifica proveedor, intentar ese primero
        if ($preferredProvider !== null && isset($this->providers[$preferredProvider])) {
            $provider = $this->providers[$preferredProvider];
            if ($provider->isAvailable()) {
                $response = $provider->chat($request);
                if ($response->success) {
                    return $response;
                }
            }
        }

        // Detectar proveedor por nombre del modelo
        $detectedProvider = $this->detectProvider($request->model);
        if ($detectedProvider !== null) {
            $response = $detectedProvider->chat($request);
            if ($response->success) {
                return $response;
            }
        }

        // Fallback: intentar cada proveedor disponible
        foreach ($this->fallbackOrder as $providerName) {
            if (!isset($this->providers[$providerName])) {
                continue;
            }

            $provider = $this->providers[$providerName];
            if (!$provider->isAvailable()) {
                continue;
            }

            $response = $provider->chat($request);
            if ($response->success) {
                return $response;
            }
        }

        return AiResponse::fromError('none', 'Ningún proveedor AI disponible');
    }

    /**
     * Lista todos los modelos de todos los proveedores disponibles
     */
    public function listAllModels(): array
    {
        $allModels = [];

        foreach ($this->providers as $provider) {
            $available = $provider->isAvailable();
            // Siempre listar modelos (fallback) para que el usuario sepa qué hay
            $models = $provider->listModels();

            $allModels[] = [
                'provider'  => $provider->getName(),
                'available' => $available,
                'models'    => $models,
            ];
        }

        return $allModels;
    }

    /**
     * Verifica el estado de todos los proveedores
     */
    public function healthCheck(): array
    {
        $status = [];

        foreach ($this->providers as $provider) {
            $status[$provider->getName()] = [
                'available' => $provider->isAvailable(),
            ];
        }

        return $status;
    }

    private function detectProvider(string $model): ?AiProviderInterface
    {
        // Modelos Anthropic
        if (str_contains($model, 'claude')) {
            return $this->providers['anthropic'] ?? null;
        }

        // Modelos OpenAI
        if (str_starts_with($model, 'gpt-') || str_starts_with($model, 'o1') || str_starts_with($model, 'o3')) {
            return $this->providers['openai'] ?? null;
        }

        // Por defecto: Ollama (modelos locales)
        return $this->providers['ollama'] ?? null;
    }
}
