import { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';
import { isTauri, tauri } from '@/services/tauri';
import { refreshTree } from '@/services/workspace-service';

export function useFileWatcher(): void {
  const current = useWorkspaceStore((s) => s.current);

  useEffect(() => {
    if (!current || !isTauri()) return undefined;

    let unlisten: (() => void) | undefined;
    let cancelled = false;

    const setup = async (): Promise<void> => {
      try {
        await tauri.startWatch(current.path);
        const { listen } = await import('@tauri-apps/api/event');
        if (cancelled) {
          await tauri.stopWatch();
          return;
        }
        unlisten = await listen<{ path: string; kind: string }>('fs-change', () => {
          void refreshTree();
        });
      } catch (err) {
        console.warn('File watch failed:', err);
      }
    };

    void setup();

    return (): void => {
      cancelled = true;
      unlisten?.();
      void tauri.stopWatch();
    };
  }, [current]);
}
