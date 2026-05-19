<?php

declare(strict_types=1);

namespace AmrHub\Support;

/**
 * Renderizador de templates PHP
 */
final class View
{
    private static string $basePath = '';

    public static function setBasePath(string $path): void
    {
        self::$basePath = rtrim($path, '/');
    }

    /**
     * Valida que el nombre de template/partial/component no contenga path traversal.
     * Solo permite caracteres alfanuméricos, guiones, puntos y barras bajas.
     */
    private static function assertSafeName(string $name, string $type): void
    {
        if (!preg_match('/^[a-zA-Z0-9_\-\.]+$/', $name)) {
            throw new \InvalidArgumentException("Nombre de {$type} inválido: {$name}");
        }
    }

    public static function render(string $template, array $data = [], ?string $layout = 'dashboard'): string
    {
        // Prevenir path traversal en el nombre del template
        self::assertSafeName($template, 'template');

        $templateFile = self::$basePath . '/' . str_replace('.', '/', $template) . '.php';

        // Verificar que el archivo resuelto esté dentro del basePath (defensa en profundidad)
        $realBase = realpath(self::$basePath);
        $realFile = realpath($templateFile);
        if ($realBase === false || $realFile === false || !str_starts_with($realFile, $realBase . DIRECTORY_SEPARATOR)) {
            throw new \RuntimeException("Acceso denegado al template: {$template}");
        }

        extract($data, EXTR_SKIP);
        ob_start();
        require $realFile;
        $content = ob_get_clean();

        if ($layout !== null) {
            // Prevenir path traversal en el nombre del layout
            self::assertSafeName($layout, 'layout');

            $layoutFile = self::$basePath . '/layouts/' . $layout . '.php';
            $realLayout = realpath($layoutFile);
            if ($realLayout === false || !str_starts_with($realLayout, $realBase . DIRECTORY_SEPARATOR)) {
                throw new \RuntimeException("Acceso denegado al layout: {$layout}");
            }

            $pageContent = $content;
            ob_start();
            require $realLayout;
            $content = ob_get_clean();
        }

        return $content;
    }

    public static function partial(string $partial, array $data = []): string
    {
        // Prevenir path traversal en el nombre del partial
        self::assertSafeName($partial, 'partial');

        $file = self::$basePath . '/partials/' . $partial . '.php';
        $realBase = realpath(self::$basePath);
        $realFile = realpath($file);
        if ($realFile === false || $realBase === false || !str_starts_with($realFile, $realBase . DIRECTORY_SEPARATOR)) {
            return '';
        }

        extract($data, EXTR_SKIP);
        ob_start();
        require $realFile;
        return ob_get_clean();
    }

    public static function component(string $component, array $data = []): string
    {
        // Prevenir path traversal en el nombre del componente
        self::assertSafeName($component, 'component');

        $file = self::$basePath . '/components/' . $component . '.php';
        $realBase = realpath(self::$basePath);
        $realFile = realpath($file);
        if ($realFile === false || $realBase === false || !str_starts_with($realFile, $realBase . DIRECTORY_SEPARATOR)) {
            return '';
        }

        extract($data, EXTR_SKIP);
        ob_start();
        require $realFile;
        return ob_get_clean();
    }
}
