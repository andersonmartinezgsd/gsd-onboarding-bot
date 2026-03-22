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
    },
};

// window.AMR ya está asignado directamente
