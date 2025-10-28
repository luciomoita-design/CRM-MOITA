'use client';

import * as React from 'react';
import { create } from 'zustand';

export type Toast = {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

interface ToastStore {
  toasts: Toast[];
  publish: (toast: Toast) => void;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  publish: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: toast.id ?? crypto.randomUUID() }]
    })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));

export const useToast = () => {
  const publish = useToastStore((state) => state.publish);
  return {
    toast: publish
  };
};

export const toast = (toast: Toast) => useToastStore.getState().publish(toast);

export const useToasts = () => useToastStore((state) => state.toasts);
export const useDismissToast = () => useToastStore((state) => state.dismiss);
