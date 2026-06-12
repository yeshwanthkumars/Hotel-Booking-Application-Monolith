import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message, type = 'info', durationMs = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setToasts((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      dismiss(id);
    }, durationMs);
  }, [dismiss]);

  const api = useMemo(() => ({
    push,
    success: (message, durationMs) => push(message, 'success', durationMs),
    error: (message, durationMs) => push(message, 'error', durationMs),
    info: (message, durationMs) => push(message, 'info', durationMs),
    warning: (message, durationMs) => push(message, 'warning', durationMs),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed right-4 top-4 z-[120] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-[min(92vw,360px)] rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm motion-safe:animate-[toast-in_.2s_ease-out] ${TOAST_STYLES[toast.type] || TOAST_STYLES.info}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                className="opacity-80 hover:opacity-100"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return ctx;
}
