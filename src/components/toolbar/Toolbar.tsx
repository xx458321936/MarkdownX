import { useUIStore } from '@/store/ui-store';
import { useEditorStore } from '@/store/editor-store';
import { importMarkdownFile, saveCurrentBrowser } from '@/services/import-service';
import { flushNow } from '@/services/auto-save-service';
import { isTauri } from '@/services/tauri';

export function Toolbar(): React.JSX.Element {
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const isDirty = useEditorStore((s) => s.isDirty);
  const currentFilePath = useEditorStore((s) => s.currentFilePath);

  const focusEditor = (): HTMLTextAreaElement | null =>
    document.querySelector<HTMLTextAreaElement>('textarea.source-pane');

  const runHistory = (cmd: 'undo' | 'redo'): void => {
    const ta = focusEditor();
    if (!ta) return;
    ta.focus({ preventScroll: true });
    // Defer so the browser registers the new active element before execCommand.
    requestAnimationFrame(() => {
      document.execCommand(cmd);
    });
  };

  const handleUndo = (): void => runHistory('undo');
  const handleRedo = (): void => runHistory('redo');

  const handleSave = (): void => {
    if (isTauri()) {
      void flushNow();
      return;
    }
    saveCurrentBrowser();
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
        className={`rounded px-2 py-1 text-xs hover:bg-border/40 ${
          isDirty ? 'text-accent' : ''
        }`}
        onClick={handleSave}
        disabled={!currentFilePath}
        title={isTauri() ? 'Save now' : 'Download current file as .md'}
      >
        {isTauri() ? 'Save' : 'Download'}
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
