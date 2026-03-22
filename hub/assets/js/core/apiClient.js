'use strict';

/**
 * AMR Hub — API Client
 * Wrapper de fetch() con manejo de errores y CSRF
 */
window.AMR = window.AMR || {};

window.AMR.api = {
    async get(url) {
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Error de red' }));
            throw new Error(error.error || error.message || `HTTP ${response.status}`);
        }

        return response.json();
    },

    async post(url, data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Error de red' }));
            throw new Error(error.error || error.message || `HTTP ${response.status}`);
        }

        return response.json();
    },

    async put(url, data = {}) {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Error de red' }));
            throw new Error(error.error || error.message || `HTTP ${response.status}`);
        }

        return response.json();
    },

    async upload(url, formData) {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Error de red' }));
            throw new Error(error.error || error.message || `HTTP ${response.status}`);
        }

        return response.json();
    },
};

// window.AMR ya está asignado directamente
