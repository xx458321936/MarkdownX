import { open } from '@tauri-apps/plugin-dialog';
import type { FileNode, RecentWorkspace, Workspace } from '@/types';
import { isTauri, tauri } from '@/services/tauri';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useUIStore } from '@/store/ui-store';

const toWorkspaceName = (path: string): string => {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};

const toFileNode = (raw: {
  id: string;
  path: string;
  name: string;
  is_dir: boolean;
  children: Array<{
    id: string;
    path: string;
    name: string;
    is_dir: boolean;
    children: unknown[];
  }>;
}): FileNode => ({
  id: raw.id,
  path: raw.path,
  name: raw.name,
  isDir: raw.is_dir,
  children: raw.children.map((c) => toFileNode(c as Parameters<typeof toFileNode>[0])),
});

const loadRecent = async (): Promise<RecentWorkspace[]> => {
  try {
    if (!isTauri()) return [];
    const raw = await tauri.loadRecent();
    return raw ? (JSON.parse(raw) as RecentWorkspace[]) : [];
  } catch (err) {
    console.warn('Failed to load recent:', err);
    return [];
  }
};

const persistRecent = async (list: RecentWorkspace[]): Promise<void> => {
  if (!isTauri()) return;
  await tauri.saveRecent(JSON.stringify(list, null, 2));
};

export const pickWorkspace = async (): Promise<Workspace | null> => {
  try {
    if (!isTauri()) {
      const path = window.prompt('Workspace directory path (Tauri not available, browser mode):');
      if (!path) return null;
      return { path, name: toWorkspaceName(path) };
    }
    const result = await open({
      directory: true,
      multiple: false,
      title: 'Select Workspace Directory',
    });
    if (typeof result !== 'string') return null;
    return { path: result, name: toWorkspaceName(result) };
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Failed to pick workspace: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
    return null;
  }
};

export const openWorkspace = async (path?: string): Promise<void> => {
  const target = path ?? (await pickWorkspace())?.path;
  if (!target) return;

  const { setLoading, setCurrent, setTree, setRecent, current } = useWorkspaceStore.getState();
  setLoading(true);
  try {
    if (!isTauri()) {
      setCurrent({ path: target, name: toWorkspaceName(target) });
      setTree({ id: target, path: target, name: toWorkspaceName(target), isDir: true, children: [] });
    } else {
      const raw = await tauri.loadTree(target);
      const tree = toFileNode(raw);
      setCurrent({ path: target, name: toWorkspaceName(target) });
      setTree(tree);
    }

    const recent = await loadRecent();
    const filtered = recent.filter((r) => r.path !== target);
    const updated: RecentWorkspace[] = [
      { path: target, name: toWorkspaceName(target), openedAt: Date.now() },
      ...filtered,
    ].slice(0, 10);
    await persistRecent(updated);
    setRecent(updated);
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Failed to open workspace: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
    void current;
  } finally {
    setLoading(false);
  }
};

export const closeWorkspace = (): void => {
  const { setCurrent, setTree } = useWorkspaceStore.getState();
  setCurrent(null);
  setTree(null);
};

export const refreshTree = async (): Promise<void> => {
  const current = useWorkspaceStore.getState().current;
  if (!current) return;
  const { setTree, setLoading } = useWorkspaceStore.getState();
  setLoading(true);
  try {
    if (!isTauri()) return;
    const raw = await tauri.loadTree(current.path);
    setTree(toFileNode(raw));
  } catch (err) {
    useUIStore.getState().pushToast({
      message: `Failed to refresh: ${String(err)}`,
      kind: 'error',
      duration: 3000,
    });
  } finally {
    setLoading(false);
  }
};
