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

// window.AMR ya está asignado directamente
