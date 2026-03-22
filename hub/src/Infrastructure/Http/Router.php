<?php

declare(strict_types=1);

namespace AmrHub\Infrastructure\Http;

/**
 * Router simple basado en regex — despacha a Controllers
 */
final class Router
{
    /** @var array<string, array<array{pattern: string, handler: array, params: array}>> */
    private array $routes = [];

    public function get(string $path, array $handler): self
    {
        return $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, array $handler): self
    {
        return $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, array $handler): self
    {
        return $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, array $handler): self
    {
        return $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, array $handler): self
    {
        $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $path);
        $pattern = '#^' . $pattern . '$#';

        $this->routes[$method][] = [
            'pattern' => $pattern,
            'handler' => $handler,
            'params'  => [],
        ];

        return $this;
    }

    public function dispatch(Request $request): Response
    {
        $method = $request->method();
        $uri = $request->uri();

        // Soporte PUT/DELETE via _method — solo métodos HTTP válidos
        if ($method === 'POST' && $request->input('_method')) {
            $override = strtoupper((string) $request->input('_method'));
            if (in_array($override, ['PUT', 'PATCH', 'DELETE'], true)) {
                $method = $override;
            }
        }

        $routes = $this->routes[$method] ?? [];

        foreach ($routes as $route) {
            if (preg_match($route['pattern'], $uri, $matches)) {
                $params = array_filter($matches, fn($key) => !is_int($key), ARRAY_FILTER_USE_KEY);

                [$controllerClass, $action] = $route['handler'];

                if (!class_exists($controllerClass)) {
                    return Response::json(['error' => "Controlador no encontrado: {$controllerClass}"], 500);
                }

                $controller = new $controllerClass();

                if (!method_exists($controller, $action)) {
                    return Response::json(['error' => "Acción no encontrada: {$action}"], 500);
                }

                try {
                    return $controller->{$action}($request, $params);
                } catch (\Throwable $e) {
                    // No exponer el mensaje de excepción al cliente
                    return Response::json([
                        'error' => 'Error interno del servidor',
                    ], 500);
                }
            }
        }

        return Response::json(['error' => 'Ruta no encontrada'], 404);
    }
}
