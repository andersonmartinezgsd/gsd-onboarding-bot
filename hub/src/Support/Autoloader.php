<?php

declare(strict_types=1);

/**
 * PSR-4 Autoloader — AMR Hub
 * Carga automática de clases sin Composer en runtime
 */
final class Autoloader
{
    /** @var array<string, string> */
    private static array $prefixes = [];

    public static function register(): void
    {
        spl_autoload_register([self::class, 'loadClass']);
    }

    public static function addNamespace(string $prefix, string $baseDir): void
    {
        $prefix = trim($prefix, '\\') . '\\';
        $baseDir = rtrim($baseDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        self::$prefixes[$prefix] = $baseDir;
    }

    public static function loadClass(string $class): bool
    {
        foreach (self::$prefixes as $prefix => $baseDir) {
            if (str_starts_with($class, $prefix)) {
                $relativeClass = substr($class, strlen($prefix));
                $file = $baseDir . str_replace('\\', DIRECTORY_SEPARATOR, $relativeClass) . '.php';

                if (file_exists($file)) {
                    require $file;
                    return true;
                }
            }
        }

        return false;
    }
}
