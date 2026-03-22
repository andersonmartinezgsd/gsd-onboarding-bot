<?php

declare(strict_types=1);

namespace AmrHub\Support;

/**
 * Configuración centralizada — carga arrays PHP desde config/
 */
final class Config
{
    private static ?self $instance = null;
    private array $data = [];

    private function __construct(string $configPath)
    {
        $configFile = $configPath . '/config.php';
        if (file_exists($configFile)) {
            $this->data = require $configFile;
        }
    }

    public static function load(string $configPath): self
    {
        if (self::$instance === null) {
            self::$instance = new self($configPath);
        }
        return self::$instance;
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            throw new \RuntimeException('Config no ha sido cargada. Llama Config::load() primero.');
        }
        return self::$instance;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $keys = explode('.', $key);
        $value = $this->data;

        foreach ($keys as $segment) {
            if (!is_array($value) || !array_key_exists($segment, $value)) {
                return $default;
            }
            $value = $value[$segment];
        }

        return $value;
    }

    public function has(string $key): bool
    {
        return $this->get($key) !== null;
    }

    public function all(): array
    {
        return $this->data;
    }
}
