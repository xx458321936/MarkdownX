import { useMemo } from 'react';
import type { InlineMark } from '@/types';

interface Props {
  text: string;
  marks: InlineMark[];
  baseKey?: string;
}

interface Segment {
  start: number;
  end: number;
  text: string;
  marks: InlineMark[];
  segId: string;
}

const markPriority: Record<InlineMark['type'], number> = {
  code: 0,
  bold: 1,
  italic: 2,
  strike: 3,
  link: 4,
};

const buildSegments = (text: string, marks: InlineMark[]): Segment[] => {
  if (!text) return [];
  if (marks.length === 0) {
    return [
      {
        start: 0,
        end: text.length,
        text,
        marks: [],
        segId: 's0',
      },
    ];
  }
  const points = new Set<number>([0, text.length]);
  for (const m of marks) {
    points.add(Math.max(0, Math.min(text.length, m.start)));
    points.add(Math.max(0, Math.min(text.length, m.end)));
  }
  const sorted = Array.from(points).sort((a, b) => a - b);
  const segs: Segment[] = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const start = sorted[i] ?? 0;
    const end = sorted[i + 1] ?? start;
    if (end <= start) continue;
    const active = marks
      .filter((m) => m.start <= start && m.end >= end)
      .sort((a, b) => markPriority[a.type] - markPriority[b.type]);
    segs.push({
      start,
      end,
      text: text.slice(start, end),
      marks: active,
      segId: `s${start}-${end}`,
    });
  }
  return segs;
};

const renderMark = (mark: InlineMark, children: React.ReactNode): React.ReactNode => {
  switch (mark.type) {
    case 'bold':
      return <strong>{children}</strong>;
    case 'italic':
      return <em>{children}</em>;
    case 'strike':
      return <del>{children}</del>;
    case 'code':
      return (
        <code className="rounded bg-border/40 px-1 font-mono text-[0.9em]">{children}</code>
      );
    case 'link':
      return (
        <a
          href={mark.href ?? '#'}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </a>
      );
    default:
      return children;
  }
};

const renderSegment = (seg: Segment, baseKey: string, depth: number): React.ReactNode => {
  if (!seg.text) return null;
  const key = `${baseKey}-${seg.segId}`;
  const mark = seg.marks[depth];
  if (!mark) {
    return <span key={key}>{seg.text}</span>;
  }
  const inner = renderSegment(seg, baseKey, depth + 1);
  return <span key={key}>{renderMark(mark, inner)}</span>;
};

export function InlineRenderer({ text, marks, baseKey = 'b' }: Props): React.ReactNode {
  const segments = useMemo(() => buildSegments(text, marks), [text, marks]);
  return (
    <>
      {segments.map((seg) => renderSegment(seg, baseKey, 0))}
    </>
  );
}
