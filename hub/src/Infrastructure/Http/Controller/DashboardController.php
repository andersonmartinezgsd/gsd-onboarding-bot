<?php

declare(strict_types=1);

namespace AmrHub\Infrastructure\Http\Controller;

use AmrHub\Infrastructure\Http\Request;
use AmrHub\Infrastructure\Http\Response;
use AmrHub\Support\View;

/**
 * Controller de páginas HTML — renderiza views con layout
 */
final class DashboardController
{
    public function index(Request $request, array $params): Response
    {
        return Response::html(View::render('pages.home', [
            'pageTitle'  => 'Dashboard',
            'activePage' => 'home',
        ]));
    }

    public function aiHub(Request $request, array $params): Response
    {
        return Response::html(View::render('pages.ai-hub', [
            'pageTitle'  => 'AI Hub',
            'activePage' => 'ai-hub',
        ]));
    }

    public function projects(Request $request, array $params): Response
    {
        return Response::html(View::render('pages.projects', [
            'pageTitle'  => 'Analizador de Proyectos',
            'activePage' => 'projects',
        ]));
    }

    public function agents(Request $request, array $params): Response
    {
        return Response::html(View::render('pages.agents', [
            'pageTitle'  => 'Gestor de Agentes',
            'activePage' => 'agents',
        ]));
    }

    public function brands(Request $request, array $params): Response
    {
        return Response::html(View::render('pages.brands', [
            'pageTitle'  => 'Brand Manager',
            'activePage' => 'brands',
        ]));
    }

    public function documents(Request $request, array $params): Response
    {
        return Response::html(View::render('pages.documents', [
            'pageTitle'  => 'Document Intelligence',
            'activePage' => 'documents',
        ]));
    }

    public function agentFactory(Request $request, array $params): Response
    {
        return Response::html(View::render('pages.agent-factory', [
            'pageTitle'  => 'Agent Factory',
            'activePage' => 'agent-factory',
        ]));
    }

    public function settings(Request $request, array $params): Response
    {
        return Response::html(View::render('pages.settings', [
            'pageTitle'  => 'Configuración',
            'activePage' => 'settings',
        ]));
    }
}
