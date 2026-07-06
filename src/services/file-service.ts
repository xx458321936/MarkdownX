import { isTauri, tauri } from '@/services/tauri';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useUIStore } from '@/store/ui-store';
import { refreshTree } from '@/services/workspace-service';

const joinPath = (parent: string, name: string): string => {
  const sep = parent.includes('\\') ? '\\' : '/';
  return `${parent.replace(/[\\/]+$/, '')}${sep}${name}`;
};

const isMarkdownName = (name: string): boolean => {
  const lower = name.toLowerCase();
  return lower.endsWith('.md') || lower.endsWith('.markdown');
};

const uniquePath = async (parent: string, base: string, isDir: boolean): Promise<string> => {
  const sep = parent.includes('\\') ? '\\' : '/';
  const ext = isDir ? '' : isMarkdownName(base) ? '' : '.md';
  const stem = isDir ? base : base.replace(/\.md$/i, '');
  let candidate = `${parent.replace(/[\\/]+$/, '')}${sep}${stem}${ext}`;
  let i = 1;
  while (isTauri() && (await tauri.exists(candidate))) {
    candidate = `${parent.replace(/[\\/]+$/, '')}${sep}${stem} ${i}${ext}`;
    i += 1;
  }
  return candidate;
};

export const createFile = async (parentPath: string, name?: string): Promise<string | null> => {
  const final = await uniquePath(parentPath, name ?? 'Untitled', false);
  try {
    if (!isTauri()) {
      useUIStore.getState().pushToast({
        message: 'File creation requires Tauri',
        kind: 'warning',
        duration: 3000,
      });
      return null;
    }
    await tauri.createFile(final);
    await refreshTree();
    useWorkspaceStore.getState().expand(parentPath);
    return final;
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Create failed: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
    return null;
  }
};

export const createFolder = async (parentPath: string, name?: string): Promise<string | null> => {
  const final = await uniquePath(parentPath, name ?? 'New Folder', true);
  try {
    if (!isTauri()) {
      useUIStore.getState().pushToast({
        message: 'Folder creation requires Tauri',
        kind: 'warning',
        duration: 3000,
      });
      return null;
    }
    await tauri.mkdir(final);
    await refreshTree();
    useWorkspaceStore.getState().expand(parentPath);
    return final;
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Create folder failed: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
    return null;
  }
};

export const deleteEntry = async (path: string): Promise<void> => {
  try {
    if (!isTauri()) {
      useUIStore.getState().pushToast({
        message: 'Delete requires Tauri',
        kind: 'warning',
        duration: 3000,
      });
      return;
    }
    await tauri.deletePath(path);
    await refreshTree();
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Delete failed: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
  }
};

export const renameEntry = async (path: string, newName: string): Promise<string | null> => {
  const sep = path.includes('\\') ? '\\' : '/';
  const parts = path.split(/[\\/]/);
  parts[parts.length - 1] = newName;
  const target = parts.join(sep);
  try {
    if (!isTauri()) {
      useUIStore.getState().pushToast({
        message: 'Rename requires Tauri',
        kind: 'warning',
        duration: 3000,
      });
      return null;
    }
    await tauri.renamePath(path, target);
    await refreshTree();
    return target;
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Rename failed: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
    return null;
  }
};

export const moveEntry = async (sourcePath: string, destDir: string): Promise<string | null> => {
  if (sourcePath === destDir) return null;
  const sep = destDir.includes('\\') ? '\\' : '/';
  const name = sourcePath.split(/[\\/]/).pop() ?? '';
  const target = `${destDir.replace(/[\\/]+$/, '')}${sep}${name}`;
  if (target === sourcePath) return null;
  try {
    if (!isTauri()) {
      useUIStore.getState().pushToast({
        message: 'Move requires Tauri',
        kind: 'warning',
        duration: 3000,
      });
      return null;
    }
    await tauri.movePath(sourcePath, target);
    await refreshTree();
    return target;
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Move failed: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
    return null;
  }
};

export { joinPath, isMarkdownName };
