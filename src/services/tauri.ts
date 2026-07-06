import { invoke } from '@tauri-apps/api/core';

export interface FileEntry {
  path: string;
  name: string;
  is_dir: boolean;
  is_file: boolean;
  size: number;
  children: FileEntry[] | null;
}

export interface SearchHitRaw {
  path: string;
  name: string;
  is_dir: boolean;
  line: number | null;
  snippet: string | null;
}

export interface TreeNodeRaw {
  id: string;
  path: string;
  name: string;
  is_dir: boolean;
  children: TreeNodeRaw[];
}

export const isTauri = (): boolean => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const tauri = {
  readDirectory(path: string): Promise<FileEntry[]> {
    return invoke<FileEntry[]>('read_directory', { path });
  },
  readFile(path: string): Promise<string> {
    return invoke<string>('read_file', { path });
  },
  writeFile(path: string, content: string): Promise<void> {
    return invoke<void>('write_file', { path, content });
  },
  deletePath(path: string): Promise<void> {
    return invoke<void>('delete_path', { path });
  },
  renamePath(from: string, to: string): Promise<void> {
    return invoke<void>('rename_path', { from, to });
  },
  movePath(from: string, to: string): Promise<void> {
    return invoke<void>('move_path', { from, to });
  },
  mkdir(path: string): Promise<void> {
    return invoke<void>('mkdir', { path });
  },
  createFile(path: string): Promise<void> {
    return invoke<void>('create_file', { path });
  },
  exists(path: string): Promise<boolean> {
    return invoke<boolean>('exists', { path });
  },
  loadTree(root: string): Promise<TreeNodeRaw> {
    return invoke<TreeNodeRaw>('load_tree', { root });
  },
  searchFiles(root: string, query: string, content: boolean): Promise<SearchHitRaw[]> {
    return invoke<SearchHitRaw[]>('search_files', { root, query, content });
  },
  startWatch(path: string): Promise<void> {
    return invoke<void>('start_watch', { path });
  },
  stopWatch(): Promise<void> {
    return invoke<void>('stop_watch');
  },
  loadSettings(): Promise<string> {
    return invoke<string>('load_settings');
  },
  saveSettings(content: string): Promise<void> {
    return invoke<void>('save_settings', { content });
  },
  loadRecent(): Promise<string> {
    return invoke<string>('load_recent');
  },
  saveRecent(content: string): Promise<void> {
    return invoke<void>('save_recent', { content });
  },
};
