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
  return window.confirm('You have unsaved changes. Discard them and open the new file?');
};

const pickFileBrowser = (): Promise<File | null> =>
  new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,text/markdown,text/plain';
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.onchange = (): void => {
      resolve(input.files?.[0] ?? null);
    };
    input.oncancel = (): void => resolve(null);
    document.body.appendChild(input);
    input.click();
    setTimeout(() => input.remove(), 60_000);
  });

const loadFromBrowser = async (file: File): Promise<void> => {
  const text = await file.text();
  useEditorStore.getState().setContent(text);
  useEditorStore.getState().setCurrentFile(file.name);
  useEditorStore.getState().markSaved();
  useUIStore.getState().pushToast({
    message: `Opened ${file.name}`,
    kind: 'success',
    duration: 2000,
  });
};

const loadFromTauri = async (path: string): Promise<void> => {
  const content = await tauri.readFile(path);
  useEditorStore.getState().setContent(content);
  useEditorStore.getState().setCurrentFile(path);
  useEditorStore.getState().markSaved();

  const recent = useWorkspaceStore.getState().recent;
  const filtered = recent.filter((r) => r.path !== path);
  useWorkspaceStore.getState().setRecent(
    [
      { path, name: toFileName(path), openedAt: Date.now() },
      ...filtered,
    ].slice(0, 10),
  );

  useUIStore.getState().pushToast({
    message: `Opened ${toFileName(path)}`,
    kind: 'success',
    duration: 2000,
  });
};

export const importMarkdownFile = async (): Promise<void> => {
  if (!confirmDiscardIfDirty()) return;

  if (!isTauri()) {
    const file = await pickFileBrowser();
    if (!file) return;
    try {
      await loadFromBrowser(file);
    } catch (err) {
      useUIStore.getState().pushToast({
        message: `Failed to read file: ${String(err)}`,
        kind: 'error',
        duration: 3000,
      });
    }
    return;
  }

  let selected: string | string[] | null;
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
    await loadFromTauri(selected);
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Failed to open file: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
  }
};

export const saveCurrentBrowser = (): void => {
  const state = useEditorStore.getState();
  const filename = state.currentFilePath ?? 'untitled.md';
  const blob = new Blob([state.currentContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  state.markSaved();
  useUIStore.getState().pushToast({
    message: `Downloaded ${filename}`,
    kind: 'success',
    duration: 2000,
  });
};
