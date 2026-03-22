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

    public static function render(string $template, array $data = [], ?string $layout = 'dashboard'): string
    {
        $templateFile = self::$basePath . '/' . str_replace('.', '/', $template) . '.php';

        if (!file_exists($templateFile)) {
            throw new \RuntimeException("Template no encontrado: {$templateFile}");
        }

        extract($data, EXTR_SKIP);
        ob_start();
        require $templateFile;
        $content = ob_get_clean();

        if ($layout !== null) {
            $layoutFile = self::$basePath . '/layouts/' . $layout . '.php';
            if (!file_exists($layoutFile)) {
                throw new \RuntimeException("Layout no encontrado: {$layoutFile}");
            }

            $pageContent = $content;
            ob_start();
            require $layoutFile;
            $content = ob_get_clean();
        }

        return $content;
    }

    public static function partial(string $partial, array $data = []): string
    {
        $file = self::$basePath . '/partials/' . $partial . '.php';
        if (!file_exists($file)) {
            return '';
        }

        extract($data, EXTR_SKIP);
        ob_start();
        require $file;
        return ob_get_clean();
    }

    public static function component(string $component, array $data = []): string
    {
        $file = self::$basePath . '/components/' . $component . '.php';
        if (!file_exists($file)) {
            return '';
        }

        extract($data, EXTR_SKIP);
        ob_start();
        require $file;
        return ob_get_clean();
    }
}
