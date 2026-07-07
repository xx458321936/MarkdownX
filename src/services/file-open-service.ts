import { useEditorStore } from '@/store/editor-store';
import { useUIStore } from '@/store/ui-store';
import { isTauri, tauri } from '@/services/tauri';

export const openFile = async (path: string): Promise<void> => {
  try {
    if (!isTauri()) {
      useUIStore.getState().pushToast({
        message: 'File open requires Tauri',
        kind: 'warning',
        duration: 2500,
      });
      return;
    }
    const content = await tauri.readFile(path);
    useEditorStore.getState().setContent(content);
    useEditorStore.getState().setCurrentFile(path);
    useEditorStore.getState().markSaved();
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Open failed: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
  }
};
