<?php

declare(strict_types=1);

/**
 * AMR Hub — Bootstrap / Front Controller
 * ÚNICO archivo PHP en public/
 */

// ── Error handling ──────────────────────────────────
error_reporting(E_ALL);
ini_set('display_errors', '0');
set_exception_handler(function (\Throwable $e) {
    $isAjax = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')
           || str_contains($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '', 'XMLHttpRequest');

    if ($isAjax) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'error'   => 'Error interno del servidor',
            'message' => $e->getMessage(),
            'file'    => basename($e->getFile()),
            'line'    => $e->getLine(),
        ]);
    } else {
        http_response_code(500);
        echo '<h1 style="color:#EF4444;font-family:Inter,sans-serif">Error del servidor</h1>';
        echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
    }
    exit;
});

// ── Autoloader PSR-4 ────────────────────────────────
$basePath = dirname(__DIR__);
require $basePath . '/src/Support/Autoloader.php';

\Autoloader::register();
\Autoloader::addNamespace('AmrHub\\', $basePath . '/src/');

// ── Config ──────────────────────────────────────────
use AmrHub\Support\Config;
use AmrHub\Support\Database;
use AmrHub\Support\Logger;
use AmrHub\Support\View;
use AmrHub\Infrastructure\Http\Router;
use AmrHub\Infrastructure\Http\Request;

$configPath = $basePath . '/config';
$configFile = $configPath . '/config.php';

if (!file_exists($configFile)) {
    copy($configPath . '/config.example.php', $configFile);
}

$config = Config::load($configPath);

// ── Logger ──────────────────────────────────────────
Logger::init($config->get('storage.logs', $basePath . '/storage/logs'));

// ── Database init ───────────────────────────────────
$db = Database::getConnection();

// Auto-crear tablas si no existen
$schemaFile = $basePath . '/database/schema.sqlite.sql';
if (file_exists($schemaFile)) {
    $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='agents'")->fetch();
    if (!$tables) {
        $db->exec(file_get_contents($schemaFile));
        Logger::getInstance()->info('Schema de base de datos inicializada');
    }
}

// ── Session ─────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ── Views ───────────────────────────────────────────
View::setBasePath($basePath . '/views');

// ── Router ──────────────────────────────────────────
$router = new Router();

// Páginas (HTML)
$router->get('/', [\AmrHub\Infrastructure\Http\Controller\DashboardController::class, 'index']);
$router->get('/ai-hub', [\AmrHub\Infrastructure\Http\Controller\DashboardController::class, 'aiHub']);
$router->get('/projects', [\AmrHub\Infrastructure\Http\Controller\DashboardController::class, 'projects']);
$router->get('/agents', [\AmrHub\Infrastructure\Http\Controller\DashboardController::class, 'agents']);
$router->get('/brands', [\AmrHub\Infrastructure\Http\Controller\DashboardController::class, 'brands']);
$router->get('/documents', [\AmrHub\Infrastructure\Http\Controller\DashboardController::class, 'documents']);
$router->get('/agent-factory', [\AmrHub\Infrastructure\Http\Controller\DashboardController::class, 'agentFactory']);
$router->get('/settings', [\AmrHub\Infrastructure\Http\Controller\DashboardController::class, 'settings']);

// API JSON
$apiCtrl = \AmrHub\Infrastructure\Http\Controller\ApiController::class;
$router->get('/api/v1/dashboard/stats', [$apiCtrl, 'dashboardStats']);
$router->post('/api/v1/ai/chat', [$apiCtrl, 'aiChat']);
$router->get('/api/v1/ai/providers', [$apiCtrl, 'listProviders']);
$router->post('/api/v1/ai/providers/test', [$apiCtrl, 'testProvider']);
$router->get('/api/v1/agents', [$apiCtrl, 'listAgents']);
$router->post('/api/v1/agents', [$apiCtrl, 'createAgent']);
$router->post('/api/v1/agents/generate', [$apiCtrl, 'generateAgent']);
$router->post('/api/v1/agents/export-md', [$apiCtrl, 'exportAgentMd']);
$router->post('/api/v1/projects/scan', [$apiCtrl, 'scanProject']);
$router->get('/api/v1/projects/{id}/report', [$apiCtrl, 'projectReport']);
$router->post('/api/v1/documents/upload', [$apiCtrl, 'uploadDocument']);

// ── Dispatch ────────────────────────────────────────
$request = new Request();
$response = $router->dispatch($request);
$response->send();
