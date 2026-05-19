<?php

declare(strict_types=1);

namespace AmrHub\Support;

use PDO;
use PDOException;

/**
 * Conexión a base de datos — Singleton por request
 * Soporta SQLite (dev) y MySQL (producción)
 */
final class Database
{
    private static ?PDO $connection = null;

    private function __construct() {}

    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            $config = Config::getInstance();
            $driver = $config->get('database.driver', 'sqlite');

            try {
                self::$connection = match ($driver) {
                    'sqlite' => self::createSqliteConnection($config),
                    'mysql'  => self::createMysqlConnection($config),
                    default  => throw new \RuntimeException("Driver de DB no soportado: {$driver}"),
                };
            } catch (PDOException $e) {
                // Envolver la excepción sin exponer DSN ni credenciales
                throw new \RuntimeException('No se pudo conectar a la base de datos.', 0, $e);
            }
        }

        return self::$connection;
    }

    private static function createSqliteConnection(Config $config): PDO
    {
        $path = $config->get('database.sqlite_path', __DIR__ . '/../../storage/db/amr_hub.sqlite');
        $dir = dirname($path);

        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $pdo = new PDO("sqlite:{$path}");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA journal_mode=WAL');
        $pdo->exec('PRAGMA foreign_keys=ON');

        return $pdo;
    }

    private static function createMysqlConnection(Config $config): PDO
    {
        $host = $config->get('database.host', 'localhost');
        $port = $config->get('database.port', 3306);
        $name = $config->get('database.name', 'amr_hub');
        $user = $config->get('database.user', 'root');
        $pass = $config->get('database.password', '');

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);

        return $pdo;
    }

    public static function close(): void
    {
        self::$connection = null;
    }
}
