import { create } from 'zustand';
import type { FileNode, RecentWorkspace, Workspace } from '@/types';

interface WorkspaceState {
  current: Workspace | null;
  tree: FileNode | null;
  recent: RecentWorkspace[];
  isLoading: boolean;
  expanded: Set<string>;
  setCurrent: (workspace: Workspace | null) => void;
  setTree: (tree: FileNode | null) => void;
  setRecent: (recent: RecentWorkspace[]) => void;
  setLoading: (loading: boolean) => void;
  toggleExpanded: (id: string) => void;
  expand: (id: string) => void;
  collapse: (id: string) => void;
  isExpanded: (id: string) => boolean;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  current: null,
  tree: null,
  recent: [],
  isLoading: false,
  expanded: new Set<string>(),
  setCurrent: (current) => set({ current }),
  setTree: (tree) => set({ tree }),
  setRecent: (recent) => set({ recent }),
  setLoading: (isLoading) => set({ isLoading }),
  toggleExpanded: (id) => {
    const next = new Set(get().expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ expanded: next });
  },
  expand: (id) => {
    const next = new Set(get().expanded);
    next.add(id);
    set({ expanded: next });
  },
  collapse: (id) => {
    const next = new Set(get().expanded);
    next.delete(id);
    set({ expanded: next });
  },
  isExpanded: (id) => get().expanded.has(id),
}));
