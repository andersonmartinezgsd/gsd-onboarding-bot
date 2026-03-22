<?php

declare(strict_types=1);

namespace AmrHub\Support;

/**
 * Logger basado en archivos — nunca en directorio público
 */
final class Logger
{
    private static ?self $instance = null;
    private readonly string $logPath;

    private function __construct(string $logPath)
    {
        $this->logPath = rtrim($logPath, '/');
        if (!is_dir($this->logPath)) {
            mkdir($this->logPath, 0755, true);
        }
    }

    public static function init(string $logPath): self
    {
        if (self::$instance === null) {
            self::$instance = new self($logPath);
        }
        return self::$instance;
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            throw new \RuntimeException('Logger no inicializado. Llama Logger::init() primero.');
        }
        return self::$instance;
    }

    public function info(string $message, array $context = []): void
    {
        $this->write('INFO', $message, $context);
    }

    public function error(string $message, array $context = []): void
    {
        $this->write('ERROR', $message, $context);
    }

    public function warning(string $message, array $context = []): void
    {
        $this->write('WARNING', $message, $context);
    }

    public function debug(string $message, array $context = []): void
    {
        $this->write('DEBUG', $message, $context);
    }

    private function write(string $level, string $message, array $context): void
    {
        $date = date('Y-m-d');
        $time = date('Y-m-d H:i:s');
        $file = "{$this->logPath}/{$date}.log";

        $contextStr = !empty($context) ? ' ' . json_encode($context, JSON_UNESCAPED_UNICODE) : '';
        $line = "[{$time}] [{$level}] {$message}{$contextStr}" . PHP_EOL;

        file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
    }
}
