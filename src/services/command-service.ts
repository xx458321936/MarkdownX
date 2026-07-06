import type { Block, Command, Document } from '@/types';
import { generateId } from '@/utils/id';
import { useEditorStore } from '@/store/editor-store';

interface InsertBlockArgs {
  blockId: string;
  position: 'before' | 'after';
  block: Block;
}

interface RemoveBlockArgs {
  blockId: string;
  block: Block;
  index: number;
}

export const insertBlockCommand = ({ blockId, position, block }: InsertBlockArgs): Command => {
  return {
    id: generateId(),
    label: 'Insert block',
    apply: (): void => {
      const state = useEditorStore.getState();
      const idx = state.document.blocks.findIndex((b) => b.id === blockId);
      if (idx === -1) return;
      const insertAt = position === 'before' ? idx : idx + 1;
      const blocks = [...state.document.blocks];
      blocks.splice(insertAt, 0, block);
      state.setDocument({ ...state.document, blocks });
      state.markDirty();
    },
    revert: (): void => {
      const state = useEditorStore.getState();
      state.setDocument({
        ...state.document,
        blocks: state.document.blocks.filter((b) => b.id !== block.id),
      });
      state.markDirty();
    },
  };
};

export const removeBlockCommand = ({ blockId, block, index }: RemoveBlockArgs): Command => ({
  id: generateId(),
  label: 'Remove block',
  apply: (): void => {
    const state = useEditorStore.getState();
    state.setDocument({
      ...state.document,
      blocks: state.document.blocks.filter((b) => b.id !== blockId),
    });
    state.markDirty();
  },
  revert: (): void => {
    const state = useEditorStore.getState();
    const blocks = [...state.document.blocks];
    blocks.splice(Math.min(index, blocks.length), 0, block);
    state.setDocument({ ...state.document, blocks });
    state.markDirty();
  },
});

export const updateBlockTextCommand = (
  blockId: string,
  prevText: string,
  nextText: string,
): Command => ({
  id: generateId(),
  label: 'Edit text',
  apply: (): void => {
    const state = useEditorStore.getState();
    state.setDocument({
      ...state.document,
      blocks: state.document.blocks.map((b) => (b.id === blockId ? { ...b, text: nextText } : b)),
    });
    state.markDirty();
  },
  revert: (): void => {
    const state = useEditorStore.getState();
    state.setDocument({
      ...state.document,
      blocks: state.document.blocks.map((b) => (b.id === blockId ? { ...b, text: prevText } : b)),
    });
    state.markDirty();
  },
});

export const changeBlockTypeCommand = (
  blockId: string,
  prevBlock: Block,
  nextBlock: Block,
): Command => ({
  id: generateId(),
  label: 'Change block type',
  apply: (): void => {
    const state = useEditorStore.getState();
    state.setDocument({
      ...state.document,
      blocks: state.document.blocks.map((b) => (b.id === blockId ? nextBlock : b)),
    });
    state.markDirty();
  },
  revert: (): void => {
    const state = useEditorStore.getState();
    state.setDocument({
      ...state.document,
      blocks: state.document.blocks.map((b) => (b.id === blockId ? prevBlock : b)),
    });
    state.markDirty();
  },
});

export const replaceDocumentCommand = (prevDoc: Document, nextDoc: Document): Command => ({
  id: generateId(),
  label: 'Replace document',
  apply: (): void => {
    useEditorStore.getState().setDocument(nextDoc);
    useEditorStore.getState().markDirty();
  },
  revert: (): void => {
    useEditorStore.getState().setDocument(prevDoc);
    useEditorStore.getState().markDirty();
  },
});
