import { useUIStore } from '@/store/ui-store';
import { importMarkdownFile } from '@/services/import-service';

export function Toolbar(): React.JSX.Element {
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);

  const focusEditor = (): HTMLTextAreaElement | null =>
    document.querySelector<HTMLTextAreaElement>('textarea.source-pane');

  const handleUndo = (): void => {
    const ta = focusEditor();
    ta?.focus();
    document.execCommand('undo');
  };
  const handleRedo = (): void => {
    const ta = focusEditor();
    ta?.focus();
    document.execCommand('redo');
  };

  return (
    <header className="flex h-10 shrink-0 items-center gap-1 border-b border-border bg-bg-sidebar px-2">
      <span className="px-2 text-sm font-semibold">MarkFlow</span>
      <div className="mx-2 h-5 w-px bg-border" />
      <button
        type="button"
        className="rounded px-2 py-1 text-xs hover:bg-border/40"
        onClick={handleUndo}
        title="Undo (Ctrl+Z)"
      >
        Undo
      </button>
      <button
        type="button"
        className="rounded px-2 py-1 text-xs hover:bg-border/40"
        onClick={handleRedo}
        title="Redo (Ctrl+Y)"
      >
        Redo
      </button>
      <div className="mx-2 h-5 w-px bg-border" />
      <button
        type="button"
        className="rounded px-2 py-1 text-xs hover:bg-border/40"
        onClick={() => void importMarkdownFile()}
        title="Import a single .md file (no workspace required)"
      >
        Import
      </button>
      <button
        type="button"
        className="rounded px-2 py-1 text-xs hover:bg-border/40"
        onClick={() => setSearchOpen(true)}
        title="Search (Ctrl+F)"
      >
        Search
      </button>
      <button
        type="button"
        className="rounded px-2 py-1 text-xs hover:bg-border/40"
        onClick={() => setCommandPaletteOpen(true)}
        title="Quick Open (Ctrl+P)"
      >
        Quick Open
      </button>
      <div className="ml-auto" />
      <button
        type="button"
        className="rounded px-2 py-1 text-xs hover:bg-border/40"
        onClick={() => setSettingsOpen(true)}
        title="Settings"
      >
        Settings
      </button>
    </header>
  );
}
