import { writable } from 'svelte/store';
// Create writable store for toasts
const toastsStore = writable([]);
function addToast(message, type = 'info', duration = 4000) {
    if (typeof window === 'undefined')
        return ''; // SSR safety
    const id = Math.random().toString(36).substring(2, 9);
    const toast = { id, message, type, duration };
    toastsStore.update(toasts => [...toasts, toast]);
    if (duration > 0) {
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }
    return id;
}
function removeToast(id) {
    if (typeof window === 'undefined')
        return; // SSR safety
    toastsStore.update(toasts => toasts.filter(toast => toast.id !== id));
}
function clearAllToasts() {
    if (typeof window === 'undefined')
        return; // SSR safety
    toastsStore.set([]);
}
// Convenience methods
function showSuccess(message, duration) {
    return addToast(message, 'success', duration);
}
function showError(message, duration) {
    return addToast(message, 'error', duration);
}
function showWarning(message, duration) {
    return addToast(message, 'warning', duration);
}
function showInfo(message, duration) {
    return addToast(message, 'info', duration);
}
export const toastManager = {
    toasts: toastsStore,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
};
