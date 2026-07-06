import { useEffect, useMemo, useRef, useState } from 'react';
import type { Block } from '@/types';
import { BlockView } from '@/components/editor/BlockView';

interface Props {
  blocks: Block[];
  estimateHeight?: number;
  overscan?: number;
}

export function VirtualBlockList({ blocks, estimateHeight = 32, overscan = 8 }: Props): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    setHeight(el.clientHeight);
    const ro = new ResizeObserver(() => setHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const onScroll = (): void => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const visible = useMemo(() => {
    if (height === 0) return { start: 0, end: blocks.length };
    const start = Math.max(0, Math.floor(scrollTop / estimateHeight) - overscan);
    const end = Math.min(blocks.length, Math.ceil((scrollTop + height) / estimateHeight) + overscan);
    return { start, end };
  }, [blocks.length, scrollTop, height, estimateHeight, overscan]);

  const offsetY = visible.start * estimateHeight;
  const totalHeight = blocks.length * estimateHeight;

  return (
    <div ref={containerRef} className="relative h-full overflow-auto">
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: offsetY, left: 0, right: 0 }}>
          {blocks.slice(visible.start, visible.end).map((block) => (
            <BlockView key={block.id} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}
