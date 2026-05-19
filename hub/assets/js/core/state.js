'use strict';

/**
 * AMR Hub — Estado global simple
 */
window.AMR = window.AMR || {};

window.AMR.state = {
    _data: {},
    _listeners: {},

    set(key, value) {
        this._data[key] = value;
        (this._listeners[key] || []).forEach(fn => fn(value));
    },

    get(key, defaultValue = null) {
        return this._data[key] ?? defaultValue;
    },

    on(key, callback) {
        if (!this._listeners[key]) this._listeners[key] = [];
        this._listeners[key].push(callback);
        // Retornar función de cleanup para evitar memory leaks
        return () => this.off(key, callback);
    },

    off(key, callback) {
        if (!this._listeners[key]) return;
        this._listeners[key] = this._listeners[key].filter(fn => fn !== callback);
    },

    reset() {
        this._data = {};
        this._listeners = {};
    },
};

// window.AMR ya está asignado directamente
