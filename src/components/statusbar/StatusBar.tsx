import { useEditorStore } from '@/store/editor-store';
import { useWorkspaceStore } from '@/store/workspace-store';

export function StatusBar(): React.JSX.Element {
  const document = useEditorStore((s) => s.document);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const current = useWorkspaceStore((s) => s.current);

  const chars = document.blocks.reduce((sum, b) => sum + b.text.length, 0);
  const lines = document.blocks.length;

  let saveLabel = 'Saved';
  if (isSaving) saveLabel = 'Saving…';
  else if (isDirty) saveLabel = 'Unsaved';

  return (
    <footer className="flex h-6 shrink-0 items-center gap-3 border-t border-border bg-bg-sidebar px-3 text-xs text-fg-muted">
      <span>{current?.name ?? 'No workspace'}</span>
      <span>{lines} blocks</span>
      <span>{chars} chars</span>
      <span className="ml-auto">{saveLabel}</span>
    </footer>
  );
}
