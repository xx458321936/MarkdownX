import { useUIStore } from '@/store/ui-store';

export function ConfirmDialog(): React.JSX.Element | null {
  const dialog = useUIStore((s) => s.confirmDialog);
  const hideConfirm = useUIStore((s) => s.hideConfirm);

  if (!dialog.open) return null;

  const handleConfirm = (): void => {
    dialog.onConfirm?.();
    hideConfirm();
  };

  const handleCancel = (): void => {
    dialog.onCancel?.();
    hideConfirm();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-96 rounded-lg border border-border bg-bg shadow-lg">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">{dialog.title}</div>
        <div className="px-4 py-4 text-sm text-fg-muted">{dialog.message}</div>
        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            className="rounded px-3 py-1 text-xs hover:bg-border/40"
            onClick={handleCancel}
          >
            {dialog.cancelText}
          </button>
          <button
            type="button"
            className={`rounded px-3 py-1 text-xs text-white ${
              dialog.destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-accent hover:opacity-90'
            }`}
            onClick={handleConfirm}
          >
            {dialog.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
