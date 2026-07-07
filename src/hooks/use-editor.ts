import { useCallback, useState } from 'react';
import type { Block, BlockType } from '@/types';
import { useEditorStore } from '@/store/editor-store';
import { generateId } from '@/utils/id';
import {
  insertBlockCommand,
  removeBlockCommand,
  updateBlockTextCommand,
  changeBlockTypeCommand,
} from '@/services/command-service';
import { parseInlineText } from '@/services/markdown-service';

interface TriggerMatch {
  prefix: string;
  type: BlockType;
  patch?: Partial<Block>;
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
  { prefix: '---', type: 'horizontal-rule' },
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

const SELECTOR = (id: string): string => `textarea[data-block-id="${id}"]`;

const getCaretOffset = (el: HTMLTextAreaElement): number => el.selectionStart ?? el.value.length;

const setCaretOffset = (el: HTMLTextAreaElement, offset: number): void => {
  const max = el.value.length;
  const pos = Math.max(0, Math.min(max, offset));
  try {
    el.setSelectionRange(pos, pos);
  } catch {
    /* noop */
  }
};

const focusBlock = (id: string, offset?: number): void => {
  const el = document.querySelector<HTMLTextAreaElement>(SELECTOR(id));
  if (!el) return;
  el.focus();
  if (offset !== undefined) {
    requestAnimationFrame(() => setCaretOffset(el, offset));
  }
};

export function useEditor(block: Block): {
  isActive: boolean;
  handleInput: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  handleFocus: () => void;
  placeholder: (type: BlockType, level?: number) => string;
} {
  const [isActive, setIsActive] = useState(false);
  const pushCommand = useEditorStore((s) => s.pushCommand);

  const handleFocus = useCallback((): void => {
    setIsActive(true);
  }, []);

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>): void => {
      const el = e.currentTarget;
      const text = el.value;
      if (text === block.text) return;
      const parsed = parseInlineText(text);
      useEditorStore.getState().setDocument({
        ...useEditorStore.getState().document,
        blocks: useEditorStore.getState().document.blocks.map((b) =>
          b.id === block.id ? { ...b, text: parsed.text, marks: parsed.marks } : b,
        ),
      });
      useEditorStore.getState().markDirty();
    },
    [block.id, block.text],
  );

  const tryLiveBlockTrigger = (
    el: HTMLTextAreaElement,
    currentText: string,
  ): boolean => {
    const trigger = detectBlockTrigger(currentText);
    if (!trigger) return false;
    const nextType = trigger.type;
    const stripped = currentText.slice(trigger.prefix.length).replace(/^ /, '');
    const prevBlock: Block = { ...block, text: currentText, marks: [] };
    const nextBlock: Block = {
      ...block,
      type: nextType,
      text: stripped,
      marks: parseInlineText(stripped).marks,
      ...(trigger.patch ?? {}),
    };
    const cmd = changeBlockTypeCommand(block.id, prevBlock, nextBlock);
    pushCommand(cmd);
    cmd.apply();
    el.value = stripped;
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
    return true;
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget;
      const offset = getCaretOffset(el);
      const state = useEditorStore.getState();
      const blocks = state.document.blocks;
      const idx = blocks.findIndex((b) => b.id === block.id);
      const prev = blocks[idx - 1];
      const next = blocks[idx + 1];

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const newBlock: Block = {
          id: generateId(),
          type: block.type === 'bullet-list' || block.type === 'ordered-list' || block.type === 'task-list'
            ? 'paragraph'
            : 'paragraph',
          text: '',
          marks: [],
        };
        const cmd = insertBlockCommand({ blockId: block.id, position: 'after', block: newBlock });
        pushCommand(cmd);
        cmd.apply();
        requestAnimationFrame(() => focusBlock(newBlock.id, 0));
        return;
      }
      if (e.key === 'Enter' && e.shiftKey) {
        return;
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        if (tryLiveBlockTrigger(el, el.value)) {
          e.preventDefault();
          return;
        }
      }

      if (e.key === 'Backspace') {
        if (offset === 0 && el.value === '' && idx > 0) {
          e.preventDefault();
          const cmd = removeBlockCommand({ blockId: block.id, block, index: idx });
          pushCommand(cmd);
          cmd.apply();
          requestAnimationFrame(() => {
            const target = document.querySelector<HTMLTextAreaElement>(SELECTOR(prev.id));
            if (target) setCaretOffset(target, target.value.length);
          });
          return;
        }
        if (offset === 0 && el.value === '' && idx === 0) {
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
          const indented = el.value.startsWith('  ')
            ? el.value.slice(2)
            : `  ${el.value}`;
          const cmd = updateBlockTextCommand(block.id, el.value, indented);
          pushCommand(cmd);
          cmd.apply();
          el.value = indented;
          requestAnimationFrame(() => setCaretOffset(el, indented.length));
        } else {
          const newText = el.value.slice(0, offset) + '  ' + el.value.slice(offset);
          const cmd = updateBlockTextCommand(block.id, el.value, newText);
          pushCommand(cmd);
          cmd.apply();
          el.value = newText;
          requestAnimationFrame(() => setCaretOffset(el, offset + 2));
        }
      }

      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const cmd = removeBlockCommand({ blockId: block.id, block, index: idx });
        pushCommand(cmd);
        cmd.apply();
        const targetId = next?.id ?? prev?.id ?? block.id;
        requestAnimationFrame(() => focusBlock(targetId, 0));
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
    (e: React.ClipboardEvent<HTMLTextAreaElement>): void => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      const el = e.currentTarget;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? start;
      const newText = el.value.slice(0, start) + text + el.value.slice(end);
      const parsed = parseInlineText(newText);
      useEditorStore.getState().setDocument({
        ...useEditorStore.getState().document,
        blocks: useEditorStore.getState().document.blocks.map((b) =>
          b.id === block.id ? { ...b, text: parsed.text, marks: parsed.marks } : b,
        ),
      });
      useEditorStore.getState().markDirty();
      el.value = parsed.text;
      requestAnimationFrame(() => setCaretOffset(el, start + text.length));
    },
    [block.id],
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

  return { isActive, handleInput, handleKeyDown, handlePaste, handleFocus, placeholder };
}
