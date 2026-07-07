import { open } from '@tauri-apps/plugin-dialog';
import { useEditorStore } from '@/store/editor-store';
import { useUIStore } from '@/store/ui-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import { isTauri, tauri } from '@/services/tauri';

const toFileName = (path: string): string => {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};

const confirmDiscardIfDirty = (): boolean => {
  const state = useEditorStore.getState();
  if (!state.isDirty) return true;
  const ok = window.confirm(
    'You have unsaved changes. Discard them and open the new file?',
  );
  return ok;
};

export const importMarkdownFile = async (): Promise<void> => {
  if (!isTauri()) {
    useUIStore.getState().pushToast({
      message: 'Import requires Tauri (use pnpm tauri dev)',
      kind: 'warning',
      duration: 3000,
    });
    return;
  }
  if (!confirmDiscardIfDirty()) return;

  let selected: string | string[] | null = null;
  try {
    selected = await open({
      multiple: false,
      directory: false,
      title: 'Import Markdown File',
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Import dialog failed: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
    return;
  }

  if (typeof selected !== 'string') return;

  try {
    const content = await tauri.readFile(selected);
    useEditorStore.getState().setContent(content);
    useEditorStore.getState().setCurrentFile(selected);
    useEditorStore.getState().markSaved();

    const recent = useWorkspaceStore.getState().recent;
    const filtered = recent.filter((r) => r.path !== selected);
    useWorkspaceStore.getState().setRecent([
      { path: selected, name: toFileName(selected), openedAt: Date.now() },
      ...filtered,
    ].slice(0, 10));

    useUIStore.getState().pushToast({
      message: `Opened ${toFileName(selected)}`,
      kind: 'success',
      duration: 2000,
    });
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Failed to open file: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
  }
};
