export interface Workspace {
  path: string;
  name: string;
}

export interface FileNode {
  id: string;
  path: string;
  name: string;
  isDir: boolean;
  children: FileNode[];
}

export interface RecentWorkspace {
  path: string;
  name: string;
  openedAt: number;
}

export interface ThemeSettings {
  theme: 'light' | 'dark';
  fontFamily: string;
  fontSize: number;
  tabSize: number;
  autoSaveDelay: number;
  defaultWorkspace: string | null;
}

export interface ToastMessage {
  id: string;
  message: string;
  kind: 'info' | 'success' | 'error' | 'warning';
  duration: number;
}

export interface SearchHit {
  path: string;
  name: string;
  isDir: boolean;
  line: number | null;
  snippet: string | null;
}
