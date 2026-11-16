import { createContext, useContext } from 'react';

export type ToastKind = 'success' | 'error';

export interface ToastApi {
  showToast: (message: string, kind?: ToastKind) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
