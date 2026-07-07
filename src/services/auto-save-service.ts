import { useEditorStore } from '@/store/editor-store';
import { useSettingStore } from '@/store/setting-store';
import { useUIStore } from '@/store/ui-store';
import { isTauri, tauri } from '@/services/tauri';

interface SaveEntry {
  path: string;
  content: string;
  queuedAt: number;
}

const queue: Map<string, SaveEntry> = new Map();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushInFlight = false;

const persistFlush = async (): Promise<void> => {
  if (flushInFlight) return;
  flushInFlight = true;
  try {
    const entries = Array.from(queue.values());
    queue.clear();
    for (const entry of entries) {
      try {
        await tauri.writeFile(entry.path, entry.content);
        const state = useEditorStore.getState();
        if (state.currentFilePath === entry.path) {
          state.markSaved();
        }
      } catch (err) {
        useUIStore.getState().pushToast({
          message: `Save failed: ${String(err)}`,
          kind: 'error',
          duration: 3000,
        });
      }
    }
  } finally {
    flushInFlight = false;
  }
};

export const scheduleSave = (): void => {
  const state = useEditorStore.getState();
  const path = state.currentFilePath;
  if (!path || !isTauri()) return;
  if (!state.isDirty) return;
  // No real file in browser mode: caller should use saveCurrentBrowser() instead.
  queue.set(path, { path, content: state.currentContent, queuedAt: Date.now() });

  const delay = useSettingStore.getState().settings.autoSaveDelay;
  if (flushTimer) clearTimeout(flushTimer);
  state.setSaving(true);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void persistFlush();
  }, Math.max(100, delay));
};

export const flushNow = async (): Promise<void> => {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  await persistFlush();
};
