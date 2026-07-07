import { create } from 'zustand';

interface EditorState {
  currentContent: string;
  currentFilePath: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;

  setContent: (text: string) => void;
  setCurrentFile: (path: string | null) => void;
  markDirty: () => void;
  markSaved: () => void;
  setSaving: (saving: boolean) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentContent: '',
  currentFilePath: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,

  setContent: (currentContent) => set({ currentContent, isDirty: true }),
  setCurrentFile: (currentFilePath) => set({ currentFilePath }),
  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false, lastSavedAt: Date.now() }),
  setSaving: (isSaving) => set({ isSaving }),
  reset: () =>
    set({
      currentContent: '',
      currentFilePath: null,
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
    }),
}));
