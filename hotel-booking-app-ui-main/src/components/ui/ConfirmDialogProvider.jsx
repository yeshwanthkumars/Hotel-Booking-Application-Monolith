import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ConfirmDialogContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    tone: 'danger',
    onConfirm: null,
  });

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  }, []);

  const openConfirm = useCallback((options) => {
    setDialogState({
      isOpen: true,
      title: options?.title || 'Are you sure?',
      description: options?.description || 'Please confirm this action.',
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      tone: options?.tone || 'danger',
      onConfirm: options?.onConfirm || null,
    });
  }, []);

  const confirm = useCallback(() => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
    closeDialog();
  }, [dialogState, closeDialog]);

  const toneClass = dialogState.tone === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-indigo-600 hover:bg-indigo-700';

  const api = useMemo(() => ({ openConfirm, closeDialog }), [openConfirm, closeDialog]);

  return (
    <ConfirmDialogContext.Provider value={api}>
      {children}
      {dialogState.isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={dialogState.title}>
          <button type="button" className="absolute inset-0 bg-black/45" onClick={closeDialog} aria-label="Close confirmation dialog" />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl motion-safe:animate-[fade-in_.2s_ease-out]">
            <h3 className="text-lg font-semibold text-slate-900">{dialogState.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{dialogState.description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50"
              >
                {dialogState.cancelText}
              </button>
              <button
                type="button"
                onClick={confirm}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${toneClass}`}
              >
                {dialogState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }

  return ctx;
}
