'use strict';

/**
 * AMR Hub — API Client
 * Wrapper de fetch() con manejo de errores y CSRF
 */
window.AMR = window.AMR || {};

window.AMR.api = {
    /** Lee el CSRF token del meta tag si existe */
    _csrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : null;
    },

    /** Construye los headers base para requests JSON */
    _jsonHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        const csrf = this._csrfToken();
        if (csrf) headers['X-CSRF-Token'] = csrf;
        return headers;
    },

    /** Parsea el error de la respuesta de forma segura */
    async _parseError(response) {
        const body = await response.json().catch(() => ({}));
        return new Error(body.error || body.message || `HTTP ${response.status}`);
    },

    async get(url) {
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) throw await this._parseError(response);
        return response.json();
    },

    async post(url, data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: this._jsonHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) throw await this._parseError(response);
        return response.json();
    },

    async put(url, data = {}) {
        const response = await fetch(url, {
            method: 'PUT',
            headers: this._jsonHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) throw await this._parseError(response);
        return response.json();
    },

    async delete(url) {
        const headers = { 'Accept': 'application/json' };
        const csrf = this._csrfToken();
        if (csrf) headers['X-CSRF-Token'] = csrf;

        const response = await fetch(url, { method: 'DELETE', headers });

        if (!response.ok) throw await this._parseError(response);
        return response.json();
    },

    async upload(url, formData) {
        const headers = { 'Accept': 'application/json' };
        const csrf = this._csrfToken();
        if (csrf) headers['X-CSRF-Token'] = csrf;

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) throw await this._parseError(response);
        return response.json();
    },
};

// ── Utilidades de accesibilidad ────────────────────────────
window.AMR.a11y = {
    /**
     * Trampa de foco real dentro de un elemento (para modales).
     * Devuelve la función de limpieza para remover el listener.
     *
     * @param {HTMLElement} container - El modal o elemento contenedor
     * @returns {Function} cleanup — llamar al cerrar el modal
     */
    trapFocus(container) {
        const FOCUSABLE = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ].join(', ');

        function handleTab(e) {
            if (e.key !== 'Tab') return;

            const focusable = [...container.querySelectorAll(FOCUSABLE)];
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last  = focusable[focusable.length - 1];

            if (e.shiftKey) {
                // Shift+Tab: si estamos en el primero, saltar al último
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                // Tab: si estamos en el último, saltar al primero
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }

        container.addEventListener('keydown', handleTab);
        // Retornar cleanup
        return () => container.removeEventListener('keydown', handleTab);
    },
};

// ── Error boundary global para promesas no capturadas ──────
window.addEventListener('unhandledrejection', (event) => {
    console.error('[AMR] Promesa no capturada:', event.reason);

    // Mostrar toast de error si el sistema de notificaciones está disponible
    if (window.AMR?.toast?.error) {
        window.AMR.toast.error('Ocurrió un error inesperado. Intenta de nuevo.');
    }

    // Prevenir que el error aparezca en consola como "Uncaught"
    event.preventDefault();
});

// window.AMR ya está asignado directamente
