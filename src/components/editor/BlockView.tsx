import type { Block } from '@/types';
import { useEditor } from '@/hooks/use-editor';
import { InlineRenderer } from '@/components/editor/InlineRenderer';

interface Props {
  block: Block;
}

export function BlockView({ block }: Props): React.JSX.Element {
  const { isActive, handleInput, handleKeyDown, handlePaste, handleFocus, placeholder } =
    useEditor(block);

  return (
    <div
      data-block-id={block.id}
      data-active={isActive}
      data-block-type={block.type}
      data-empty={block.text.length === 0}
      className={renderClassName(block)}
    >
      <div className="rendered-layer" aria-hidden>
        {block.text.length === 0 ? (
          <span className="placeholder">{placeholder(block.type, block.level)}</span>
        ) : (
          <InlineRenderer
            text={block.text}
            marks={block.marks}
            baseKey={block.id}
          />
        )}
      </div>
      <textarea
        data-block-id={block.id}
        value={block.text}
        rows={1}
        spellCheck={false}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        className="edit-layer"
      />
    </div>
  );
}

const renderClassName = (block: Block): string => {
  const base =
    'prose-block relative min-h-[1.5em] rounded outline-none focus-within:bg-border/15';
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
      return `${base}`;
    case 'ordered-list':
      return `${base}`;
    case 'task-list':
      return `${base} flex items-center gap-2`;
    case 'horizontal-rule':
      return 'my-2 h-px w-full border-0 bg-border';
    default:
      return base;
  }
};
