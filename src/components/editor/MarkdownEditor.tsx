import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { useUIStore } from '@/store/ui-store';
import { useAutoSave } from '@/hooks/use-auto-save';
import { renderMarkdown } from '@/services/markdown-service';
import { Divider } from '@/components/editor/Divider';

export function MarkdownEditor(): React.JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const content = useEditorStore((s) => s.currentContent);
  const setContent = useEditorStore((s) => s.setContent);
  const splitRatio = useUIStore((s) => s.splitRatio);
  const [html, setHtml] = useState('');

  useAutoSave();

  useEffect(() => {
    const handle = setTimeout(() => setHtml(renderMarkdown(content)), 100);
    return () => clearTimeout(handle);
  }, [content]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--split-left',
      `${(splitRatio * 100).toFixed(2)}%`,
    );
  }, [splitRatio]);

  return (
    <div className="split-editor">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing Markdown…"
        spellCheck={false}
        className="source-pane"
      />
      <Divider />
      <div
        className="preview-pane"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
