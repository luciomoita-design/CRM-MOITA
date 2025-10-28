'use client';

import { useEffect } from 'react';
import { Icons } from './icons';
import { useDismissToast, useToasts } from './use-toast';

export const Toaster = () => {
  const toasts = useToasts();
  const dismiss = useDismissToast();

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) => setTimeout(() => dismiss(toast.id!), 4000));
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, dismiss]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex w-72 items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {toast.variant === 'destructive' ? (
            <span className="mt-1 text-red-500">!</span>
          ) : (
            <Icons.spinner className="h-4 w-4 animate-spin text-brand" />
          )}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{toast.title}</h3>
            {toast.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{toast.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
