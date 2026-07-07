import { create } from 'zustand';
import type { ToastMessage } from '@/types';
import { generateId } from '@/utils/id';

interface UIState {
  showSearch: boolean;
  showSettings: boolean;
  showCommandPalette: boolean;
  splitRatio: number;
  confirmDialog: {
    open: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    onCancel: (() => void) | null;
    confirmText: string;
    cancelText: string;
    destructive: boolean;
  };
  toasts: ToastMessage[];
  setSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSplitRatio: (ratio: number) => void;
  showConfirm: (opts: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
  }) => void;
  hideConfirm: () => void;
  pushToast: (msg: Omit<ToastMessage, 'id'>) => string;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showSearch: false,
  showSettings: false,
  showCommandPalette: false,
  splitRatio: 0.5,
  confirmDialog: {
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    destructive: false,
  },
  toasts: [],
  setSearchOpen: (showSearch) => set({ showSearch }),
  setSettingsOpen: (showSettings) => set({ showSettings }),
  setCommandPaletteOpen: (showCommandPalette) => set({ showCommandPalette }),
  setSplitRatio: (splitRatio) => set({ splitRatio: Math.max(0.15, Math.min(0.85, splitRatio)) }),
  showConfirm: ({ title, message, onConfirm, onCancel, confirmText, cancelText, destructive }) =>
    set({
      confirmDialog: {
        open: true,
        title,
        message,
        onConfirm,
        onCancel: onCancel ?? null,
        confirmText: confirmText ?? 'Confirm',
        cancelText: cancelText ?? 'Cancel',
        destructive: destructive ?? false,
      },
    }),
  hideConfirm: () =>
    set((s) => ({ confirmDialog: { ...s.confirmDialog, open: false } })),
  pushToast: ({ message, kind, duration }) => {
    const id = generateId();
    set((s) => ({
      toasts: [...s.toasts, { id, message, kind, duration }],
    }));
    return id;
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
