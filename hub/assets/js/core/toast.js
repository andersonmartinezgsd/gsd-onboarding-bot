'use strict';

/**
 * AMR Hub — Sistema de notificaciones Toast
 */
window.AMR = window.AMR || {};

window.AMR.toast = {
    show(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
        };

        const typeLabels = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información',
        };

        const toast = document.createElement('div');
        toast.className = `amr-toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        toast.setAttribute('aria-atomic', 'true');

        // Crear elementos individuales para evitar XSS via innerHTML con message
        const icon = document.createElement('i');
        icon.className = icons[type] || icons.info;
        icon.setAttribute('aria-hidden', 'true');

        const srLabel = document.createElement('span');
        srLabel.className = 'sr-only';
        srLabel.textContent = typeLabels[type] + ': ';

        const text = document.createElement('span');
        text.textContent = message; // textContent escapa automáticamente

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.setAttribute('aria-label', 'Cerrar notificación');
        closeBtn.textContent = '×';

        toast.appendChild(icon);
        toast.appendChild(srLabel);
        toast.appendChild(text);
        toast.appendChild(closeBtn);

        const dismiss = () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        };

        closeBtn.addEventListener('click', dismiss);

        container.appendChild(toast);

        // Animar entrada
        requestAnimationFrame(() => toast.classList.add('show'));

        // Auto-remover
        const timer = setTimeout(dismiss, duration);

        // Pausar al hacer hover
        toast.addEventListener('mouseenter', () => clearTimeout(timer));
        toast.addEventListener('mouseleave', () => setTimeout(dismiss, 1000));
    },

    success(message) { this.show(message, 'success'); },
    error(message)   { this.show(message, 'error', 6000); },
    warning(message) { this.show(message, 'warning'); },
    info(message)    { this.show(message, 'info'); },
};

// window.AMR ya está asignado directamente
