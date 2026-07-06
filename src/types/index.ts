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

export interface Selection {
  blockId: string;
  offset: number;
  anchor: number;
  focus: number;
}

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'quote'
  | 'code'
  | 'code-block'
  | 'ordered-list'
  | 'bullet-list'
  | 'task-list'
  | 'horizontal-rule';

export interface InlineMark {
  type: 'bold' | 'italic' | 'strike' | 'code' | 'link';
  start: number;
  end: number;
  href?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  level?: number;
  text: string;
  marks: InlineMark[];
  checked?: boolean;
  language?: string;
}

export interface Document {
  id: string;
  path: string | null;
  blocks: Block[];
}

export interface SearchHit {
  path: string;
  name: string;
  isDir: boolean;
  line: number | null;
  snippet: string | null;
}

export interface Command {
  id: string;
  apply: () => void;
  revert: () => void;
  label?: string;
}

export interface EditorSaveEntry {
  path: string;
  content: string;
}
