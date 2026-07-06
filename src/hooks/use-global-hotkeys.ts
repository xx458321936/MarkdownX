import { useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';

export function useGlobalHotkeys(): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      const store = useEditorStore.getState();
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const cmd = store.popUndo();
        if (cmd) cmd.revert();
      } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        const cmd = store.popRedo();
        if (cmd) cmd.apply();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
