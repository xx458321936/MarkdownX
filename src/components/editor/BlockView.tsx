import { useEffect, useRef } from 'react';
import type { Block } from '@/types';
import { useEditor } from '@/hooks/use-editor';
import { InlineRenderer } from '@/components/editor/InlineRenderer';

interface Props {
  block: Block;
}

export function BlockView({ block }: Props): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const { isActive, handleInput, handleKeyDown, handlePaste, handleFocus, placeholder } =
    useEditor(block);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== block.text) {
      ref.current.innerText = block.text;
    }
  }, [block.text]);

  return (
    <div
      ref={ref}
      contentEditable={true}
      suppressContentEditableWarning
      data-block-id={block.id}
      data-empty={block.text.length === 0}
      data-placeholder={placeholder(block.type, block.level)}
      className={renderClassName(block)}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
      data-active={isActive}
    >
      {block.text.length === 0 ? null : (
        <InlineRenderer
          text={block.text}
          marks={block.marks}
          baseKey={block.id}
        />
      )}
    </div>
  );
}

const renderClassName = (block: Block): string => {
  const base = 'prose-block rounded px-1 py-0.5 outline-none focus:bg-border/15';
  switch (block.type) {
    case 'heading':
      return `${base} font-bold ${
        block.level === 1
          ? 'text-3xl'
          : block.level === 2
            ? 'text-2xl'
            : block.level === 3
              ? 'text-xl'
              : 'text-lg'
      }`;
    case 'paragraph':
      return base;
    case 'quote':
      return `${base} border-l-4 border-accent pl-3 italic text-fg-muted`;
    case 'code':
      return `${base} rounded bg-border/40 px-1 font-mono text-sm`;
    case 'code-block':
      return `${base} whitespace-pre-wrap rounded bg-border/40 p-3 font-mono text-sm`;
    case 'bullet-list':
      return `${base} relative pl-6 before:absolute before:left-1 before:content-['•']`;
    case 'ordered-list':
      return `${base} relative pl-7 before:absolute before:left-1 before:content-['1.']`;
    case 'task-list':
      return `${base} flex items-center gap-2`;
    case 'horizontal-rule':
      return 'h-px w-full border-0 bg-border';
    default:
      return base;
  }
};
