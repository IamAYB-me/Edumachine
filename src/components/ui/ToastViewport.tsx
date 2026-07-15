import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/utils';
import { useToastStore, type Toast } from '@/store/useToastStore';

const toastStyles: Record<Toast['variant'], { icon: typeof CheckCircle2; accent: string; panel: string }> = {
  success: {
    icon: CheckCircle2,
    accent: 'text-emerald-600 dark:text-emerald-400',
    panel: 'border-emerald-200/80 bg-emerald-50/95 dark:border-emerald-900/60 dark:bg-emerald-950/80',
  },
  info: {
    icon: Info,
    accent: 'text-blue-600 dark:text-blue-400',
    panel: 'border-blue-200/80 bg-blue-50/95 dark:border-blue-900/60 dark:bg-blue-950/80',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'text-amber-600 dark:text-amber-400',
    panel: 'border-amber-200/80 bg-amber-50/95 dark:border-amber-900/60 dark:bg-amber-950/80',
  },
  error: {
    icon: AlertCircle,
    accent: 'text-rose-600 dark:text-rose-400',
    panel: 'border-rose-200/80 bg-rose-50/95 dark:border-rose-900/60 dark:bg-rose-950/80',
  },
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => {
        const config = toastStyles[toast.variant];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-3xl border p-4 shadow-2xl shadow-slate-900/10 backdrop-blur transition-all duration-200',
              config.panel
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('mt-0.5 rounded-2xl bg-white/80 p-2 dark:bg-slate-900/60', config.accent)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-xl p-1 text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-600 dark:hover:bg-slate-900/60 dark:hover:text-slate-200"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
