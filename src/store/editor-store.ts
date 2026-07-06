import { create } from 'zustand';
import type { Block, Command, Document, Selection } from '@/types';
import { generateId } from '@/utils/id';

interface EditorState {
  document: Document;
  selection: Selection | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;
  undoStack: Command[];
  redoStack: Command[];
  currentFilePath: string | null;

  setDocument: (doc: Document) => void;
  setSelection: (selection: Selection | null) => void;
  setCurrentFile: (path: string | null) => void;
  markDirty: () => void;
  markSaved: () => void;
  setSaving: (saving: boolean) => void;
  pushCommand: (cmd: Command) => void;
  popUndo: () => Command | null;
  popRedo: () => Command | null;
  clearHistory: () => void;
  reset: () => void;
}

const createEmptyDocument = (): Document => ({
  id: generateId(),
  path: null,
  blocks: [
    {
      id: generateId(),
      type: 'paragraph',
      text: '',
      marks: [],
    },
  ],
});

export const useEditorStore = create<EditorState>((set, get) => ({
  document: createEmptyDocument(),
  selection: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  undoStack: [],
  redoStack: [],
  currentFilePath: null,

  setDocument: (document) => set({ document, isDirty: false, lastSavedAt: Date.now() }),
  setSelection: (selection) => set({ selection }),
  setCurrentFile: (currentFilePath) => set({ currentFilePath }),
  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false, lastSavedAt: Date.now() }),
  setSaving: (isSaving) => set({ isSaving }),
  pushCommand: (cmd) => {
    const undoStack = [...get().undoStack, cmd];
    if (undoStack.length > 1000) {
      undoStack.shift();
    }
    set({ undoStack, redoStack: [] });
  },
  popUndo: () => {
    const undoStack = [...get().undoStack];
    const cmd = undoStack.pop() ?? null;
    if (cmd) set({ undoStack });
    return cmd;
  },
  popRedo: () => {
    const redoStack = [...get().redoStack];
    const cmd = redoStack.pop() ?? null;
    if (cmd) set({ redoStack });
    return cmd;
  },
  clearHistory: () => set({ undoStack: [], redoStack: [] }),
  reset: () =>
    set({
      document: createEmptyDocument(),
      selection: null,
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
      currentFilePath: null,
      undoStack: [],
      redoStack: [],
    }),
}));

export const selectBlockById = (doc: Document, id: string): Block | undefined =>
  doc.blocks.find((b) => b.id === id);
