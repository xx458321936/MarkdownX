import { useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useEditorStore } from '@/store/editor-store';
import { createFile, createFolder } from '@/services/file-service';
import { useWorkspaceStore } from '@/store/workspace-store';

export function useFileActions(): void {
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const showSettings = useUIStore((s) => s.setSettingsOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        const current = useWorkspaceStore.getState().current;
        if (current) void createFile(current.path);
      } else if (e.key === 'N' && e.shiftKey) {
        e.preventDefault();
        const current = useWorkspaceStore.getState().current;
        if (current) void createFolder(current.path);
      } else if (e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      } else if (e.key === ',') {
        e.preventDefault();
        showSettings(true);
      }
      void useEditorStore;
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen, setCommandPaletteOpen, showSettings]);
}
