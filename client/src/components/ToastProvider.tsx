import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ToastKind } from '../context/toast-context';

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const KIND_CLASS: Record<ToastKind, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, kind }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-1200 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 text-sm shadow-md ${KIND_CLASS[toast.kind]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
