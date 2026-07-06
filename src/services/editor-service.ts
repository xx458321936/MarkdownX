import type { Block, BlockType, Document, InlineMark, Selection } from '@/types';
import { generateId } from '@/utils/id';
import { useEditorStore } from '@/store/editor-store';
import { documentToMarkdown } from '@/services/markdown-service';

export const insertBlockAfter = (doc: Document, blockId: string, type: BlockType): Block => {
  const index = doc.blocks.findIndex((b) => b.id === blockId);
  const newBlock: Block = {
    id: generateId(),
    type,
    text: type === 'heading' ? '' : '',
    marks: [],
    level: type === 'heading' ? 1 : undefined,
  };
  const next = [...doc.blocks];
  next.splice(index + 1, 0, newBlock);
  return newBlock;
};

export const removeBlock = (doc: Document, blockId: string): Document => {
  if (doc.blocks.length <= 1) return doc;
  const next = doc.blocks.filter((b) => b.id !== blockId);
  if (next.length === 0) {
    next.push({ id: generateId(), type: 'paragraph', text: '', marks: [] });
  }
  return { ...doc, blocks: next };
};

export const updateBlockText = (doc: Document, blockId: string, text: string): Document => ({
  ...doc,
  blocks: doc.blocks.map((b) =>
    b.id === blockId ? { ...b, text, marks: rebuildMarks(text) } : b,
  ),
});

const rebuildMarks = (text: string): InlineMark[] => {
  const marks: InlineMark[] = [];
  const push = (re: RegExp, type: InlineMark['type']): void => {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      marks.push({ type, start: m.index, end: m.index + m[0].length });
    }
  };
  push(/\*\*([^*]+)\*\*/g, 'bold');
  push(/\*([^*]+)\*/g, 'italic');
  push(/~~([^~]+)~~/g, 'strike');
  push(/`([^`]+)`/g, 'code');
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lm: RegExpExecArray | null;
  while ((lm = linkRe.exec(text)) !== null) {
    marks.push({ type: 'link', start: lm.index, end: lm.index + lm[1].length, href: lm[2] });
  }
  return marks;
};

export const updateBlockType = (
  doc: Document,
  blockId: string,
  type: BlockType,
  patch: Partial<Block> = {},
): Document => ({
  ...doc,
  blocks: doc.blocks.map((b) => (b.id === blockId ? { ...b, ...patch, type } : b)),
});

export const changeBlockTypeAt = (
  blockId: string,
  type: BlockType,
  patch: Partial<Block> = {},
): void => {
  const store = useEditorStore.getState();
  const next = updateBlockType(store.document, blockId, type, patch);
  store.setDocument(next);
  store.markDirty();
};

export const setCurrentSelection = (selection: Selection | null): void => {
  useEditorStore.getState().setSelection(selection);
};

export const serializeDocument = (doc: Document): string => documentToMarkdown(doc);
