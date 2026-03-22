<?php

declare(strict_types=1);

/**
 * Configuración AMR Hub
 * Copiar a config.php y ajustar valores
 */
return [
    'app' => [
        'name'    => 'AMR Hub',
        'version' => '1.0.0',
        // SEGURIDAD: cambiar a false en producción para no exponer stack traces
        'debug'   => false,
        'url'     => 'http://localhost:8080',
    ],

    'database' => [
        'driver'      => 'sqlite',
        'sqlite_path' => __DIR__ . '/../storage/db/amr_hub.sqlite',

        // MySQL (producción)
        // 'driver'   => 'mysql',
        // 'host'     => 'localhost',
        // 'port'     => 3306,
        // 'name'     => 'amr_hub',
        // 'user'     => 'root',
        // 'password' => '',
    ],

    'ai' => [
        'ollama' => [
            'base_url'      => 'http://localhost:11434',
            'default_model' => 'qwen3:8b',
        ],
        'openai' => [
            'api_key' => '', // Configurar en settings del Hub
        ],
        'anthropic' => [
            'api_key' => '', // Configurar en settings del Hub
        ],
    ],

    'storage' => [
        'uploads' => __DIR__ . '/../storage/uploads',
        'logs'    => __DIR__ . '/../storage/logs',
        'cache'   => __DIR__ . '/../storage/cache',
    ],

    'upload' => [
        'max_size_mb'    => 50,
        // SVG excluido: riesgo de XSS embebido
        // doc/docx/xlsx excluidos: riesgo de macros maliciosas
        'allowed_images' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'allowed_docs'   => ['pdf', 'txt', 'md', 'csv'],
        'allowed_videos' => ['mp4', 'webm', 'mov'],
    ],

    'security' => [
        'csrf_enabled' => true,
    ],
];
