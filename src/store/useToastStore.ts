import { create } from 'zustand';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ShowToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  showToast: (toast: ShowToastInput) => void;
  dismissToast: (id: string) => void;
}

const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  showToast: ({ title, description, variant = 'info', duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    set((state) => ({
      toasts: [...state.toasts, { id, title, description, variant }].slice(-4),
    }));

    const timer = setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
      toastTimers.delete(id);
    }, duration);

    toastTimers.set(id, timer);
  },
  dismissToast: (id) => {
    const timer = toastTimers.get(id);

    if (timer) {
      clearTimeout(timer);
      toastTimers.delete(id);
    }

    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
