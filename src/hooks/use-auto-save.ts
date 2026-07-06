import { useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { scheduleSave, flushNow } from '@/services/auto-save-service';

export function useAutoSave(): void {
  const isDirty = useEditorStore((s) => s.isDirty);
  const document = useEditorStore((s) => s.document);

  useEffect(() => {
    if (isDirty) {
      scheduleSave();
    }
  }, [isDirty, document]);

  useEffect(() => {
    const handler = (): void => {
      void flushNow();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);
}
