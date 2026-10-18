import { useEffect, useRef } from 'react';

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', busy = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    cancelRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded border border-green-700 bg-zinc-950 p-5 font-mono text-green-300 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && !busy && onCancel()}
      >
        <h2 id="confirm-title" className="mb-2 text-lg text-green-400">{title}</h2>
        <p className="mb-5 text-sm text-green-300/80">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded border border-green-700 px-3 py-1.5 text-sm hover:bg-green-500/10 disabled:opacity-50"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded border border-red-500 bg-red-500/20 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/30 disabled:opacity-50"
          >
            {busy ? 'deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
