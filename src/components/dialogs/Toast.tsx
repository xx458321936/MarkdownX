import { useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';

export function ToastHost(): React.JSX.Element {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => dismissToast(t.id), t.duration));
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, dismissToast]);

  return (
    <div className="pointer-events-none fixed bottom-8 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} message={t.message} kind={t.kind} onClose={() => dismissToast(t.id)} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  message: string;
  kind: 'info' | 'success' | 'error' | 'warning';
  onClose: () => void;
}

function ToastItem({ message, kind, onClose }: ToastItemProps): React.JSX.Element {
  const colors: Record<ToastItemProps['kind'], string> = {
    info: 'bg-accent text-white',
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-500 text-black',
    error: 'bg-red-600 text-white',
  };
  return (
    <button
      type="button"
      onClick={onClose}
      className={`pointer-events-auto rounded px-4 py-2 text-sm shadow-md ${colors[kind]}`}
    >
      {message}
    </button>
  );
}
