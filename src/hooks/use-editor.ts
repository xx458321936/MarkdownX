import { useCallback, useState } from 'react';
import type { Block, BlockType, Selection } from '@/types';
import { useEditorStore } from '@/store/editor-store';
import { generateId } from '@/utils/id';
import {
  insertBlockCommand,
  removeBlockCommand,
  updateBlockTextCommand,
  changeBlockTypeCommand,
  replaceDocumentCommand,
} from '@/services/command-service';
import { parseInlineText } from '@/services/markdown-service';

interface TriggerMatch {
  prefix: string;
  type: BlockType;
  patch?: Partial<Block>;
  nextPrefix?: string;
}

const BLOCK_TRIGGERS: TriggerMatch[] = [
  { prefix: '#', type: 'heading', patch: { level: 1 } },
  { prefix: '##', type: 'heading', patch: { level: 2 } },
  { prefix: '###', type: 'heading', patch: { level: 3 } },
  { prefix: '####', type: 'heading', patch: { level: 4 } },
  { prefix: '#####', type: 'heading', patch: { level: 5 } },
  { prefix: '######', type: 'heading', patch: { level: 6 } },
  { prefix: '>', type: 'quote' },
  { prefix: '-', type: 'bullet-list' },
  { prefix: '*', type: 'bullet-list' },
  { prefix: '1.', type: 'ordered-list' },
  { prefix: '```', type: 'code-block' },
  { prefix: '---', type: 'horizontal-rule', nextPrefix: '' },
];

const detectBlockTrigger = (text: string): TriggerMatch | null => {
  let best: TriggerMatch | null = null;
  for (const trigger of BLOCK_TRIGGERS) {
    if (text === trigger.prefix || text.startsWith(trigger.prefix + ' ')) {
      if (!best || trigger.prefix.length > best.prefix.length) {
        best = trigger;
      }
    }
  }
  return best;
};

export function useEditor(block: Block): {
  isActive: boolean;
  handleInput: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  handleFocus: () => void;
  placeholder: (type: BlockType, level?: number) => string;
} {
  const [isActive, setIsActive] = useState(false);

  const selection: Selection | null = useEditorStore((s) => s.selection);
  const setSelection = useEditorStore((s) => s.setSelection);
  const pushCommand = useEditorStore((s) => s.pushCommand);

  const getCaretOffset = (el: HTMLElement): number => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;
    const range = sel.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.endContainer, range.endOffset);
    return pre.toString().length;
  };

  const setCaretOffset = (el: HTMLElement, offset: number): void => {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    let remaining = offset;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node: Node | null = walker.nextNode();
    while (node) {
      const text = node.textContent ?? '';
      if (remaining <= text.length) {
        range.setStart(node, remaining);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      remaining -= text.length;
      node = walker.nextNode();
    }
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const focusBlock = (id: string, offset?: number): void => {
    const el = document.querySelector<HTMLElement>(`[data-block-id="${id}"]`);
    if (!el) return;
    el.focus();
    if (offset !== undefined) {
      requestAnimationFrame(() => setCaretOffset(el, offset));
    }
  };

  const commitText = (text: string, prevText: string): void => {
    if (text === prevText) return;
    const cmd = updateBlockTextCommand(block.id, prevText, text);
    pushCommand(cmd);
    cmd.apply();
  };

  const handleInput = useCallback((): void => {
    const el = document.querySelector<HTMLElement>(`[data-block-id="${block.id}"]`);
    if (!el) return;
    const text = el.innerText;
    const prev = block.text;
    if (text === prev) return;
    const parsed = parseInlineText(text);
    useEditorStore.getState().setDocument({
      ...useEditorStore.getState().document,
      blocks: useEditorStore.getState().document.blocks.map((b) =>
        b.id === block.id ? { ...b, text: parsed.text, marks: parsed.marks } : b,
      ),
    });
    useEditorStore.getState().markDirty();
    setSelection({
      blockId: block.id,
      offset: getCaretOffset(el),
      anchor: getCaretOffset(el),
      focus: getCaretOffset(el),
    });
  }, [block.id, block.text, setSelection]);

  const handleFocus = useCallback((): void => {
    setIsActive(true);
  }, []);

  const tryLiveBlockTrigger = (state: ReturnType<typeof useEditorStore.getState>, currentText: string): boolean => {
    const trigger = detectBlockTrigger(currentText);
    if (!trigger) return false;
    const nextType = trigger.type;
    const nextText = currentText.slice(trigger.prefix.length).replace(/^ /, '');
    const prevBlock: Block = { ...block, text: currentText, marks: [] };
    const nextBlock: Block = {
      ...block,
      type: nextType,
      text: nextText,
      marks: parseInlineText(nextText).marks,
      ...(trigger.patch ?? {}),
    };
    const cmd = changeBlockTypeCommand(block.id, prevBlock, nextBlock);
    pushCommand(cmd);
    cmd.apply();
    if (nextType === 'horizontal-rule') {
      const newBlock: Block = {
        id: generateId(),
        type: 'paragraph',
        text: '',
        marks: [],
      };
      const cmd2 = insertBlockCommand({ blockId: block.id, position: 'after', block: newBlock });
      pushCommand(cmd2);
      cmd2.apply();
      requestAnimationFrame(() => focusBlock(newBlock.id, 0));
    } else {
      requestAnimationFrame(() => focusBlock(block.id, 0));
    }
    void state;
    return true;
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const el = e.currentTarget as HTMLElement;
      const offset = getCaretOffset(el);
      const state = useEditorStore.getState();
      const blocks = state.document.blocks;
      const idx = blocks.findIndex((b) => b.id === block.id);
      const prev = blocks[idx - 1];
      const next = blocks[idx + 1];

      const handleEnter = (asShift: boolean): void => {
        e.preventDefault();
        if (!asShift) {
          const newBlock: Block = {
            id: generateId(),
            type: 'paragraph',
            text: '',
            marks: [],
          };
          const cmd = insertBlockCommand({ blockId: block.id, position: 'after', block: newBlock });
          pushCommand(cmd);
          cmd.apply();
          requestAnimationFrame(() => focusBlock(newBlock.id, 0));
        } else {
          const state2 = useEditorStore.getState();
          const text = state2.document.blocks[idx]?.text ?? '';
          const newText = `${text.slice(0, offset)}\n${text.slice(offset)}`;
          commitText(newText, text);
          requestAnimationFrame(() => focusBlock(block.id, offset + 1));
        }
      };

      if (e.key === 'Enter' && !e.shiftKey) return handleEnter(false);
      if (e.key === 'Enter' && e.shiftKey) return handleEnter(true);

      if (e.key === ' ' || e.key === 'Spacebar') {
        const text = state.document.blocks[idx]?.text ?? '';
        if (tryLiveBlockTrigger(state, text)) {
          e.preventDefault();
          return;
        }
      }

      if (e.key === 'Backspace') {
        if (offset === 0 && block.text === '' && idx > 0) {
          e.preventDefault();
          const cmd = removeBlockCommand({ blockId: block.id, block, index: idx });
          pushCommand(cmd);
          cmd.apply();
          requestAnimationFrame(() => focusBlock(prev.id));
          return;
        }
        if (offset === 0 && block.text === '' && idx === 0) {
          e.preventDefault();
          const cmd = changeBlockTypeCommand(block.id, block, { ...block, type: 'paragraph' });
          pushCommand(cmd);
          cmd.apply();
        }
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const listType: BlockType | null =
          block.type === 'bullet-list' ||
          block.type === 'ordered-list' ||
          block.type === 'task-list'
            ? block.type
            : null;
        if (listType) {
          const indented = block.text.startsWith('  ')
            ? block.text.slice(2)
            : `  ${block.text}`;
          const cmd = updateBlockTextCommand(block.id, block.text, indented);
          pushCommand(cmd);
          cmd.apply();
          requestAnimationFrame(() => focusBlock(block.id, indented.length));
        } else {
          const newText = block.text.slice(0, offset) + '  ' + block.text.slice(offset);
          const cmd = updateBlockTextCommand(block.id, block.text, newText);
          pushCommand(cmd);
          cmd.apply();
          requestAnimationFrame(() => focusBlock(block.id, offset + 2));
        }
      }

      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const cmd = removeBlockCommand({ blockId: block.id, block, index: idx });
        pushCommand(cmd);
        cmd.apply();
        const targetId = next?.id ?? prev?.id ?? block.id;
        requestAnimationFrame(() => focusBlock(targetId));
        return;
      }

      if (e.key === 'ArrowUp' && e.altKey && idx > 0) {
        e.preventDefault();
        const blocksCopy = [...blocks];
        const tmp = blocksCopy[idx - 1];
        blocksCopy[idx - 1] = blocksCopy[idx];
        blocksCopy[idx] = tmp;
        useEditorStore.getState().setDocument({ ...state.document, blocks: blocksCopy });
        useEditorStore.getState().markDirty();
        requestAnimationFrame(() => focusBlock(block.id, offset));
        return;
      }
      if (e.key === 'ArrowDown' && e.altKey && idx < blocks.length - 1) {
        e.preventDefault();
        const blocksCopy = [...blocks];
        const tmp = blocksCopy[idx + 1];
        blocksCopy[idx + 1] = blocksCopy[idx];
        blocksCopy[idx] = tmp;
        useEditorStore.getState().setDocument({ ...state.document, blocks: blocksCopy });
        useEditorStore.getState().markDirty();
        requestAnimationFrame(() => focusBlock(block.id, offset));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [block, pushCommand],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent): void => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      const el = e.currentTarget as HTMLElement;
      const offset = getCaretOffset(el);
      const newText = block.text.slice(0, offset) + text + block.text.slice(offset);
      const parsed = parseInlineText(newText);
      const cmd = replaceDocumentCommand(
        useEditorStore.getState().document,
        {
          ...useEditorStore.getState().document,
          blocks: useEditorStore.getState().document.blocks.map((b) =>
            b.id === block.id ? { ...b, text: parsed.text, marks: parsed.marks } : b,
          ),
        },
      );
      pushCommand(cmd);
      cmd.apply();
      requestAnimationFrame(() => focusBlock(block.id, offset + text.length));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [block.id, block.text, pushCommand],
  );

  const placeholder = (type: BlockType, level?: number): string => {
    switch (type) {
      case 'heading':
        return `Heading ${level ?? 1}`;
      case 'paragraph':
        return 'Type something…';
      case 'quote':
        return 'Quote';
      case 'code':
        return 'Code';
      case 'code-block':
        return 'Code block';
      case 'bullet-list':
        return 'List item';
      case 'ordered-list':
        return 'List item';
      case 'task-list':
        return 'Task';
      default:
        return '';
    }
  };

  void selection;
  return { isActive, handleInput, handleKeyDown, handlePaste, handleFocus, placeholder };
}
