<?php

declare(strict_types=1);

namespace AmrHub\Infrastructure\Http\Controller;

use AmrHub\Application\Service\AiRouter;
use AmrHub\Domain\ValueObject\AiRequest;
use AmrHub\Infrastructure\Http\Request;
use AmrHub\Infrastructure\Http\Response;
use AmrHub\Support\Database;

/**
 * API JSON — consumida por el frontend via fetch()
 */
final class ApiController
{
    public function dashboardStats(Request $request, array $params): Response
    {
        $db = Database::getConnection();

        $totalAgents = $db->query("SELECT COUNT(*) as total FROM agents")->fetch()['total'];
        $activeAgents = $db->query("SELECT COUNT(*) as total FROM agents WHERE status = 'active'")->fetch()['total'];
        $totalProjects = $db->query("SELECT COUNT(*) as total FROM projects")->fetch()['total'];
        $totalConversations = $db->query("SELECT COUNT(*) as total FROM conversations")->fetch()['total'];
        $totalDocuments = $db->query("SELECT COUNT(*) as total FROM documents")->fetch()['total'];
        $totalBrands = $db->query("SELECT COUNT(*) as total FROM brands")->fetch()['total'];

        // Últimas conversaciones
        $recentChats = $db->query(
            "SELECT id, title, provider, model, created_at FROM conversations ORDER BY created_at DESC LIMIT 5"
        )->fetchAll();

        // Tareas pendientes
        $pendingTasks = $db->query(
            "SELECT at.id, at.title, at.priority, at.status, a.name as agent_name, a.icon
             FROM agent_tasks at
             JOIN agents a ON a.id = at.agent_id
             WHERE at.status IN ('pending', 'in_progress')
             ORDER BY CASE at.priority
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
             END
             LIMIT 10"
        )->fetchAll();

        return Response::json([
            'stats' => [
                'total_agents'        => (int) $totalAgents,
                'active_agents'       => (int) $activeAgents,
                'total_projects'      => (int) $totalProjects,
                'total_conversations' => (int) $totalConversations,
                'total_documents'     => (int) $totalDocuments,
                'total_brands'        => (int) $totalBrands,
            ],
            'recent_chats'  => $recentChats,
            'pending_tasks' => $pendingTasks,
        ]);
    }

    public function aiChat(Request $request, array $params): Response
    {
        // Las respuestas LLM pueden tardar varios minutos
        set_time_limit(0);

        $body = $request->jsonBody();
        $prompt = $body['prompt'] ?? '';
        $model = $body['model'] ?? 'qwen3:8b';
        $provider = $body['provider'] ?? 'ollama';
        $systemPrompt = $body['system_prompt'] ?? null;
        $conversationId = $body['conversation_id'] ?? null;

        if (empty($prompt)) {
            return Response::json(['error' => 'El prompt no puede estar vacío'], 400);
        }

        $db = Database::getConnection();

        // Crear o obtener conversación
        if ($conversationId === null) {
            $stmt = $db->prepare(
                "INSERT INTO conversations (title, provider, model) VALUES (?, ?, ?)"
            );
            $title = mb_substr($prompt, 0, 100);
            $stmt->execute([$title, $provider, $model]);
            $conversationId = (int) $db->lastInsertId();
        }

        // Obtener historial de la conversación
        $historyStmt = $db->prepare(
            "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC"
        );
        $historyStmt->execute([$conversationId]);
        $messages = $historyStmt->fetchAll();

        // Agregar el nuevo mensaje del usuario
        $messages[] = ['role' => 'user', 'content' => $prompt];

        // Guardar mensaje del usuario
        $insertMsg = $db->prepare(
            "INSERT INTO messages (conversation_id, role, content, model_used) VALUES (?, ?, ?, ?)"
        );
        $insertMsg->execute([$conversationId, 'user', $prompt, $model]);

        // Enviar al AI
        $aiRequest = new AiRequest(
            model: $model,
            messages: $messages,
            systemPrompt: $systemPrompt,
        );

        $aiRouter = $this->getAiRouter();
        $aiResponse = $aiRouter->chat($aiRequest, $provider);

        if (!$aiResponse->success) {
            return Response::json(['error' => $aiResponse->error ?? 'Proveedor AI no disponible'], 503);
        }

        // Guardar respuesta del asistente
        $insertMsg->execute([
            $conversationId,
            'assistant',
            $aiResponse->content,
            $aiResponse->model,
        ]);

        // Actualizar contador de mensajes
        $db->prepare(
            "UPDATE conversations SET message_count = message_count + 2, updated_at = datetime('now') WHERE id = ?"
        )->execute([$conversationId]);

        return Response::json([
            'conversation_id' => $conversationId,
            'response'        => $aiResponse->toArray(),
        ]);
    }

    public function listProviders(Request $request, array $params): Response
    {
        $aiRouter = $this->getAiRouter();
        return Response::json($aiRouter->listAllModels());
    }

    public function testProvider(Request $request, array $params): Response
    {
        $body = $request->jsonBody();
        $provider = $body['provider'] ?? 'ollama';

        $aiRouter = $this->getAiRouter();
        $health = $aiRouter->healthCheck();

        return Response::json([
            'provider' => $provider,
            'status'   => $health[$provider] ?? ['available' => false],
        ]);
    }

    public function listAgents(Request $request, array $params): Response
    {
        $db = Database::getConnection();
        $category = $request->query('category');

        $sql = "SELECT id, agent_id, name, category, description, icon, status, preferred_model, tasks_completed, xp, level, created_at FROM agents";
        $bindings = [];

        if ($category !== null) {
            $sql .= " WHERE category = ?";
            $bindings[] = $category;
        }

        $sql .= " ORDER BY category, name";

        $stmt = $db->prepare($sql);
        $stmt->execute($bindings);

        return Response::json(['agents' => $stmt->fetchAll()]);
    }

    public function createAgent(Request $request, array $params): Response
    {
        $body = $request->jsonBody();
        $required = ['agent_id', 'name', 'category'];

        foreach ($required as $field) {
            if (empty($body[$field])) {
                return Response::json(['error' => "Campo requerido: {$field}"], 400);
            }
        }

        $db = Database::getConnection();
        $stmt = $db->prepare(
            "INSERT INTO agents (agent_id, name, category, description, system_prompt, icon, preferred_model)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );

        try {
            $stmt->execute([
                $body['agent_id'],
                $body['name'],
                $body['category'],
                $body['description'] ?? '',
                $body['system_prompt'] ?? '',
                $body['icon'] ?? '🤖',
                $body['preferred_model'] ?? 'qwen3:8b',
            ]);

            return Response::json(['id' => (int) $db->lastInsertId(), 'message' => 'Agente creado'], 201);
        } catch (\PDOException $e) {
            return Response::json(['error' => 'El agent_id ya existe'], 409);
        }
    }

    public function generateAgent(Request $request, array $params): Response
    {
        set_time_limit(0);

        $body = $request->jsonBody();
        $name = trim($body['name'] ?? '');
        $role = trim($body['role'] ?? '');
        $skills = $body['skills'] ?? [];
        $functions = $body['functions'] ?? [];
        $category = $body['category'] ?? 'custom';
        $tools = $body['tools'] ?? [];
        $context = trim($body['context'] ?? '');

        if (empty($name)) {
            return Response::json(['error' => 'El nombre del agente es requerido'], 400);
        }

        // Construir prompt para generar el agente completo con AI
        $skillsList = !empty($skills) ? implode(', ', $skills) : 'No especificadas';
        $functionsList = !empty($functions) ? implode(', ', $functions) : 'No especificadas';
        $toolsList = !empty($tools) ? implode(', ', $tools) : 'bash, read, write, edit, glob, grep';

        $prompt = <<<PROMPT
Eres un arquitecto de agentes AI de AMR Tech. Genera la configuración COMPLETA para un nuevo agente.

DATOS DEL AGENTE:
- Nombre: {$name}
- Cargo/Rol: {$role}
- Categoría: {$category}
- Skills: {$skillsList}
- Funciones: {$functionsList}
- Herramientas: {$toolsList}
- Contexto adicional: {$context}

Genera un JSON con EXACTAMENTE esta estructura (sin texto adicional, solo el JSON):
{
    "agent_id": "slug-en-kebab-case",
    "name": "Nombre Completo del Agente",
    "icon": "emoji apropiado",
    "category": "{$category}",
    "description": "Descripción profesional de 1-2 oraciones sobre qué hace este agente",
    "system_prompt": "Prompt de sistema completo y detallado en español. Incluye: quién eres, qué haces, cómo trabajas, reglas que sigues, formato de respuestas. Mínimo 5 párrafos. Incluye reglas de CLAUDE.md de AMR Tech: SOLID, PSR-12, código en inglés, UI en español, Design System AMR.",
    "capabilities": ["cap1", "cap2", "cap3", "cap4", "cap5"],
    "tools": ["tool1", "tool2"],
    "preferred_model": "qwen3:8b",
    "temperature": 0.1,
    "opencode_md": "Contenido completo del archivo .md para OpenCode. Incluir: frontmatter con model y allowedTools, luego las instrucciones detalladas del agente."
}

REGLAS:
- El system_prompt debe ser MUY detallado y profesional
- Las capabilities deben ser específicas y accionables
- El opencode_md debe seguir el formato de OpenCode con frontmatter YAML
- Responde SOLO con el JSON, sin markdown, sin explicaciones
PROMPT;

        $aiRequest = new AiRequest(
            model: $body['model'] ?? 'qwen3:8b',
            messages: [['role' => 'user', 'content' => $prompt]],
            temperature: 0.3,
        );

        $aiRouter = $this->getAiRouter();
        $aiResponse = $aiRouter->chat($aiRequest, $body['provider'] ?? 'ollama');

        if (!$aiResponse->success) {
            return Response::json(['error' => 'Error generando agente: ' . $aiResponse->error], 500);
        }

        // Parsear la respuesta como JSON
        $content = $aiResponse->content;

        // Limpiar posible markdown wrapping
        $content = preg_replace('/^```(?:json)?\s*/m', '', $content);
        $content = preg_replace('/\s*```$/m', '', $content);
        $content = trim($content);

        $agentData = json_decode($content, true);

        if ($agentData === null) {
            return Response::json([
                'error'       => 'La AI no generó un JSON válido. Intenta de nuevo.',
                'raw_content' => $content,
            ], 422);
        }

        return Response::json([
            'agent'    => $agentData,
            'tokens'   => $aiResponse->tokensIn + $aiResponse->tokensOut,
            'latency'  => $aiResponse->latencyMs,
        ]);
    }

    public function exportAgentMd(Request $request, array $params): Response
    {
        $body = $request->jsonBody();
        $agentData = $body['agent'] ?? null;

        if ($agentData === null) {
            return Response::json(['error' => 'Datos del agente requeridos'], 400);
        }

        $agentId = $agentData['agent_id'] ?? 'custom-agent';
        $opencodeMd = $agentData['opencode_md'] ?? '';

        // Si no hay opencode_md generado, crear uno básico
        if (empty($opencodeMd)) {
            $caps = implode("\n", array_map(fn($c) => "- {$c}", $agentData['capabilities'] ?? []));
            $tools = implode(', ', $agentData['tools'] ?? ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep']);

            $opencodeMd = <<<MD
---
model: ollama/qwen3:8b
allowedTools:
  - {$tools}
---

# {$agentData['name']}

{$agentData['description']}

## Rol
{$agentData['system_prompt']}

## Capacidades
{$caps}

## Reglas
- Código en inglés, UI en español colombiano
- Aplicar SOLID y PSR-12 en PHP
- Seguir el Design System AMR en todo frontend
- Documentar cada cambio importante
MD;
        }

        // Guardar el archivo .md en la carpeta de agentes de OpenCode
        $agentsDir = $_SERVER['HOME'] . '/.config/opencode/agents';
        if (!is_dir($agentsDir)) {
            mkdir($agentsDir, 0755, true);
        }

        $mdPath = "{$agentsDir}/{$agentId}.md";
        file_put_contents($mdPath, $opencodeMd);

        // También guardar en el Framework local
        $frameworkAgentsDir = dirname(__DIR__, 5) . '/agents';
        if (!is_dir($frameworkAgentsDir)) {
            mkdir($frameworkAgentsDir, 0755, true);
        }
        file_put_contents("{$frameworkAgentsDir}/{$agentId}.md", $opencodeMd);

        // Guardar en la DB
        $db = Database::getConnection();
        $stmt = $db->prepare(
            "INSERT OR REPLACE INTO agents (agent_id, name, category, description, system_prompt, icon, preferred_model, capabilities_json, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')"
        );

        $stmt->execute([
            $agentId,
            $agentData['name'] ?? $agentId,
            $agentData['category'] ?? 'custom',
            $agentData['description'] ?? '',
            $agentData['system_prompt'] ?? '',
            $agentData['icon'] ?? '🤖',
            $agentData['preferred_model'] ?? 'qwen3:8b',
            json_encode($agentData['capabilities'] ?? []),
        ]);

        return Response::json([
            'success'  => true,
            'agent_id' => $agentId,
            'md_path'  => $mdPath,
            'message'  => "Agente '{$agentData['name']}' creado e integrado en OpenCode",
        ]);
    }

    public function scanProject(Request $request, array $params): Response
    {
        $body = $request->jsonBody();
        $path = $body['path'] ?? '';

        if (empty($path) || !is_dir($path)) {
            return Response::json(['error' => 'Ruta de proyecto no válida'], 400);
        }

        $name = basename($path);
        $db = Database::getConnection();

        // Crear proyecto
        $stmt = $db->prepare(
            "INSERT INTO projects (name, path, scan_status) VALUES (?, ?, 'scanning')"
        );
        $stmt->execute([$name, $path]);
        $projectId = (int) $db->lastInsertId();

        // Escanear archivos
        $scanResult = $this->scanDirectory($path);

        // Guardar archivos escaneados
        $insertFile = $db->prepare(
            "INSERT INTO project_files (project_id, file_path, language, line_count, size_bytes, category)
             VALUES (?, ?, ?, ?, ?, ?)"
        );

        $totalFiles = 0;
        $totalLines = 0;
        $languages = [];
        $issues = 0;

        foreach ($scanResult as $file) {
            $insertFile->execute([
                $projectId,
                $file['relative_path'],
                $file['language'],
                $file['lines'],
                $file['size'],
                $file['category'],
            ]);

            $totalFiles++;
            $totalLines += $file['lines'];

            if ($file['language'] !== null) {
                $languages[$file['language']] = ($languages[$file['language']] ?? 0) + $file['lines'];
            }

            if ($file['lines'] > 200) {
                $issues++;
            }
        }

        // Actualizar proyecto
        $db->prepare(
            "UPDATE projects SET total_files = ?, total_lines = ?, languages_json = ?, issues_count = ?, scan_status = 'complete', updated_at = datetime('now') WHERE id = ?"
        )->execute([$totalFiles, $totalLines, json_encode($languages), $issues, $projectId]);

        return Response::json([
            'project_id'  => $projectId,
            'name'        => $name,
            'total_files'  => $totalFiles,
            'total_lines'  => $totalLines,
            'languages'   => $languages,
            'issues_count' => $issues,
            'status'      => 'complete',
        ]);
    }

    public function projectReport(Request $request, array $params): Response
    {
        $id = (int) ($params['id'] ?? 0);
        $db = Database::getConnection();

        $project = $db->prepare("SELECT * FROM projects WHERE id = ?")->execute([$id]);
        $project = $db->prepare("SELECT * FROM projects WHERE id = ?");
        $project->execute([$id]);
        $project = $project->fetch();

        if (!$project) {
            return Response::json(['error' => 'Proyecto no encontrado'], 404);
        }

        $files = $db->prepare("SELECT * FROM project_files WHERE project_id = ? ORDER BY line_count DESC");
        $files->execute([$id]);

        return Response::json([
            'project' => $project,
            'files'   => $files->fetchAll(),
        ]);
    }

    public function uploadDocument(Request $request, array $params): Response
    {
        $files = $request->files('files');

        if (empty($files)) {
            return Response::json(['error' => 'No se recibieron archivos'], 400);
        }

        $db = Database::getConnection();
        $uploadPath = dirname(__DIR__, 4) . '/storage/uploads';
        $uploaded = [];

        foreach ($files as $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) {
                continue;
            }

            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $fileType = match (true) {
                in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']) => 'image',
                in_array($ext, ['pdf', 'doc', 'docx', 'txt', 'md', 'csv'])  => 'document',
                in_array($ext, ['mp4', 'webm', 'mov'])                       => 'video',
                default => 'document',
            };

            $subDir = match ($fileType) {
                'image'    => 'images',
                'video'    => 'videos',
                default    => 'documents',
            };

            $destDir = "{$uploadPath}/{$subDir}";
            if (!is_dir($destDir)) {
                mkdir($destDir, 0755, true);
            }

            $safeName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file['name']);
            $destPath = "{$destDir}/{$safeName}";

            if (move_uploaded_file($file['tmp_name'], $destPath)) {
                $stmt = $db->prepare(
                    "INSERT INTO documents (file_name, file_path, file_type, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?)"
                );
                $stmt->execute([
                    $file['name'],
                    $destPath,
                    $fileType,
                    $file['type'],
                    $file['size'],
                ]);

                $uploaded[] = [
                    'id'        => (int) $db->lastInsertId(),
                    'file_name' => $file['name'],
                    'file_type' => $fileType,
                    'size'      => $file['size'],
                ];
            }
        }

        return Response::json([
            'uploaded' => $uploaded,
            'count'    => count($uploaded),
        ]);
    }

    // ─── Helpers privados ────────────────────────────

    private function getAiRouter(): AiRouter
    {
        $config = \AmrHub\Support\Config::getInstance();

        $router = new AiRouter();

        $router->registerProvider(
            new \AmrHub\Infrastructure\Client\OllamaClient(
                $config->get('ai.ollama.base_url', 'http://localhost:11434')
            )
        );

        // Siempre registrar OpenAI y Anthropic para que aparezcan en el listado
        // Si no tienen API key, isAvailable() retorna false pero listModels() retorna fallback
        $openaiKey = $config->get('ai.openai.api_key', '');
        $router->registerProvider(new \AmrHub\Infrastructure\Client\OpenAiClient($openaiKey));

        $anthropicKey = $config->get('ai.anthropic.api_key', '');
        $router->registerProvider(new \AmrHub\Infrastructure\Client\AnthropicClient($anthropicKey));

        return $router;
    }

    private function scanDirectory(string $basePath): array
    {
        $files = [];
        $extensions = ['php', 'js', 'ts', 'css', 'html', 'json', 'sql', 'sh', 'md', 'py'];

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($basePath, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            if ($file->isDir()) {
                continue;
            }

            $path = $file->getPathname();
            $relativePath = str_replace($basePath . '/', '', $path);

            // Saltar vendor, node_modules, .git
            if (preg_match('#(vendor|node_modules|\.git)/#', $relativePath)) {
                continue;
            }

            $ext = strtolower($file->getExtension());
            if (!in_array($ext, $extensions)) {
                continue;
            }

            $lines = 0;
            $handle = fopen($path, 'r');
            if ($handle) {
                while (!feof($handle)) {
                    fgets($handle);
                    $lines++;
                }
                fclose($handle);
            }

            $language = match ($ext) {
                'php'        => 'PHP',
                'js', 'ts'   => 'JavaScript',
                'css'        => 'CSS',
                'html'       => 'HTML',
                'json'       => 'JSON',
                'sql'        => 'SQL',
                'sh'         => 'Shell',
                'md'         => 'Markdown',
                'py'         => 'Python',
                default      => null,
            };

            $category = match (true) {
                str_contains($relativePath, 'test')    => 'Test',
                str_contains($relativePath, 'config')  => 'Config',
                str_contains($relativePath, 'view')    => 'View',
                str_contains($relativePath, 'api')     => 'API',
                $ext === 'css'                          => 'Style',
                $ext === 'js'                           => 'Script',
                $ext === 'php'                          => 'PHP',
                default                                 => 'Other',
            };

            $files[] = [
                'relative_path' => $relativePath,
                'language'      => $language,
                'lines'         => $lines,
                'size'          => $file->getSize(),
                'category'      => $category,
            ];
        }

        return $files;
    }
}
