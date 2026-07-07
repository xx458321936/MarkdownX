import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Block, BlockType, Document, InlineMark } from '@/types';
import { generateId } from '@/utils/id';

interface MdTextNode {
  type: 'text';
  value: string;
}

interface MdLinkNode {
  type: 'link';
  url: string;
  children: Array<{ type: string; value?: string; children?: unknown[] }>;
}

type MdInlineNode = MdTextNode | MdLinkNode | { type: string; value?: string };

interface MdListItem {
  type: 'listItem';
  checked: boolean | null;
  children: MdBlock[];
}

interface MdBlock {
  type: string;
  depth?: number;
  value?: string;
  url?: string;
  lang?: string;
  ordered?: boolean;
  spread?: boolean;
  children?: Array<MdBlock | MdListItem | MdInlineNode>;
}

const detectListItemCheck = (
  listNode: MdBlock,
  item: MdListItem,
): { checked: boolean; text: string } | null => {
  const first = item.children[0];
  if (!first) return null;
  if (first.type === 'paragraph' && first.children?.[0]?.type === 'text') {
    const raw = (first.children[0] as MdTextNode).value;
    const m = /^\[( |x|X)\]\s*(.*)$/.exec(raw);
    if (m) {
      return { checked: m[1] !== ' ', text: m[2] };
    }
  }
  void listNode;
  return null;
};

const parseInline = (nodes: MdInlineNode[]): { text: string; marks: InlineMark[] } => {
  let text = '';
  const marks: InlineMark[] = [];
  for (const node of nodes) {
    if (node.type === 'text') {
      text += (node as MdTextNode).value;
    } else if (node.type === 'strong') {
      const start = text.length;
      const inner = parseInline(((node as unknown) as { children: MdInlineNode[] }).children);
      text += inner.text;
      marks.push({ type: 'bold', start, end: text.length });
      marks.push(...inner.marks);
    } else if (node.type === 'emphasis') {
      const start = text.length;
      const inner = parseInline(((node as unknown) as { children: MdInlineNode[] }).children);
      text += inner.text;
      marks.push({ type: 'italic', start, end: text.length });
      marks.push(...inner.marks);
    } else if (node.type === 'delete') {
      const start = text.length;
      const inner = parseInline(((node as unknown) as { children: MdInlineNode[] }).children);
      text += inner.text;
      marks.push({ type: 'strike', start, end: text.length });
      marks.push(...inner.marks);
    } else if (node.type === 'inlineCode') {
      const start = text.length;
      text += (node as { value?: string }).value ?? '';
      marks.push({ type: 'code', start, end: text.length });
    } else if (node.type === 'link') {
      const link = node as MdLinkNode;
      const start = text.length;
      const inner = parseInline(link.children as MdInlineNode[]);
      text += inner.text;
      marks.push({ type: 'link', start, end: text.length, href: link.url });
      marks.push(...inner.marks);
    } else if (node.type === 'break') {
      text += '\n';
    }
  }
  return { text, marks };
};

const detectCodeBlockLang = (node: MdBlock): string => {
  const lang = node.lang;
  if (!lang) return '';
  return lang.split(/\s+/)[0] ?? '';
};

const blockFromMarkdown = (node: MdBlock): Block | null => {
  switch (node.type) {
    case 'heading': {
      const inner = parseInline((node.children ?? []) as MdInlineNode[]);
      return {
        id: generateId(),
        type: 'heading',
        level: node.depth ?? 1,
        text: inner.text,
        marks: inner.marks,
      };
    }
    case 'paragraph': {
      const inner = parseInline((node.children ?? []) as MdInlineNode[]);
      return {
        id: generateId(),
        type: 'paragraph',
        text: inner.text,
        marks: inner.marks,
      };
    }
    case 'blockquote': {
      const childBlock = node.children?.[0];
      const innerChildren = (childBlock && 'children' in childBlock ? (childBlock.children as MdInlineNode[]) : []) ?? [];
      const inner = parseInline(innerChildren);
      return {
        id: generateId(),
        type: 'quote',
        text: inner.text,
        marks: inner.marks,
      };
    }
    case 'code': {
      return {
        id: generateId(),
        type: 'code-block',
        text: node.value ?? '',
        marks: [],
        language: detectCodeBlockLang(node),
      };
    }
    case 'list': {
      const items = (node.children ?? []) as MdListItem[];
      const ordered = Boolean(node.ordered);
      const blocks: Block[] = [];
      items.forEach((item) => {
        const task = detectListItemCheck(node, item);
        if (task !== null) {
          blocks.push({
            id: generateId(),
            type: 'task-list',
            text: task.text,
            marks: [],
            checked: task.checked,
          });
          return;
        }
        const para = item.children?.[0];
        if (para && para.type === 'paragraph') {
          const inner = parseInline((para.children ?? []) as MdInlineNode[]);
          blocks.push({
            id: generateId(),
            type: ordered ? 'ordered-list' : 'bullet-list',
            text: inner.text,
            marks: inner.marks,
          });
        }
      });
      return blocks[0] ?? null;
    }
    case 'thematicBreak': {
      return {
        id: generateId(),
        type: 'horizontal-rule',
        text: '',
        marks: [],
      };
    }
    default:
      return null;
  }
};

const processor = unified().use(remarkParse).use(remarkGfm);

export const markdownToDocument = (markdown: string, path?: string): Document => {
  const tree = processor.parse(markdown) as { children: MdBlock[] };
  const blocks: Block[] = [];
  for (const node of tree.children) {
    const b = blockFromMarkdown(node);
    if (b) blocks.push(b);
  }
  if (blocks.length === 0) {
    blocks.push({ id: generateId(), type: 'paragraph', text: '', marks: [] });
  }
  return {
    id: generateId(),
    path: path ?? null,
    blocks,
  };
};

const applyMarks = (text: string, marks: InlineMark[]): string => {
  if (marks.length === 0) return text;
  const sorted = [...marks].sort((a, b) => a.start - b.start);
  let out = '';
  let cursor = 0;
  const ranges: Array<{ start: number; end: number; mark: InlineMark }> = sorted.map((m) => ({
    start: m.start,
    end: m.end,
    mark: m,
  }));
  while (cursor < text.length) {
    const active = ranges.filter((r) => r.start <= cursor && r.end > cursor);
    const char = text[cursor] ?? '';
    if (char === '\\') {
      out += char + (text[cursor + 1] ?? '');
      cursor += 2;
      continue;
    }
    const codeActive = active.some((r) => r.mark.type === 'code');
    if (codeActive) {
      const end = ranges
        .filter((r) => r.mark.type === 'code')
        .reduce((min, r) => Math.min(min, r.end), text.length);
      out += '`' + text.slice(cursor, end) + '`';
      cursor = end;
      continue;
    }
    let prefix = '';
    let suffix = '';
    for (const r of active) {
      if (r.mark.type === 'bold') {
        prefix += '**';
        suffix = '**' + suffix;
      } else if (r.mark.type === 'italic') {
        prefix += '*';
        suffix = '*' + suffix;
      } else if (r.mark.type === 'strike') {
        prefix += '~~';
        suffix = '~~' + suffix;
      } else if (r.mark.type === 'link') {
        prefix += '[';
        suffix = `](${r.mark.href ?? ''})` + suffix;
      }
    }
    out += prefix + char + suffix;
    cursor += 1;
  }
  return out;
};

export const blockToMarkdown = (block: Block): string => {
  switch (block.type) {
    case 'heading': {
      const level = block.level ?? 1;
      return `${'#'.repeat(Math.min(6, Math.max(1, level)))} ${applyMarks(block.text, block.marks)}`;
    }
    case 'paragraph':
      return applyMarks(block.text, block.marks);
    case 'quote':
      return `> ${applyMarks(block.text, block.marks)}`;
    case 'code':
      return `\`${block.text}\``;
    case 'code-block':
      return '```' + (block.language ?? '') + '\n' + block.text + '\n```';
    case 'ordered-list':
      return `1. ${applyMarks(block.text, block.marks)}`;
    case 'bullet-list':
      return `- ${applyMarks(block.text, block.marks)}`;
    case 'task-list':
      return `- [${block.checked ? 'x' : ' '}] ${applyMarks(block.text, block.marks)}`;
    case 'horizontal-rule':
      return '---';
    default:
      return '';
  }
};

export const documentToMarkdown = (doc: Document): string =>
  doc.blocks.map(blockToMarkdown).join('\n\n');

export const BLOCK_TYPES: BlockType[] = [
  'heading',
  'paragraph',
  'quote',
  'code',
  'code-block',
  'ordered-list',
  'bullet-list',
  'task-list',
  'horizontal-rule',
];

interface MarkPattern {
  type: InlineMark['type'];
  regex: RegExp;
}

const INLINE_PATTERNS: MarkPattern[] = [
  { type: 'bold', regex: /\*\*(.+?)\*\*/g },
  { type: 'italic', regex: /(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g },
  { type: 'strike', regex: /~~(.+?)~~/g },
  { type: 'code', regex: /`([^`]+)`/g },
];

const LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

export function parseInlineText(text: string): { text: string; marks: InlineMark[] } {
  if (!text) return { text, marks: [] };
  const ranges: Array<{ start: number; end: number; mark: InlineMark }> = [];
  for (const { type, regex } of INLINE_PATTERNS) {
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const start = m.index + (m[0].length - m[1].length);
      const end = start + m[1].length;
      ranges.push({ start, end, mark: { type, start, end } });
    }
  }
  LINK_REGEX.lastIndex = 0;
  let lm: RegExpExecArray | null;
  while ((lm = LINK_REGEX.exec(text)) !== null) {
    const inner = lm[1] ?? '';
    const start = lm.index + (lm[0].length - inner.length - (lm[2]?.length ?? 0) - 3);
    const end = start + inner.length;
    ranges.push({ start, end, mark: { type: 'link', start, end, href: lm[2] ?? '' } });
  }
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);
  const marks: InlineMark[] = ranges.map((r) => r.mark);
  return { text, marks };
}
