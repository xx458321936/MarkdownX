import { useEditorStore } from '@/store/editor-store';
import { useUIStore } from '@/store/ui-store';

export function Toolbar(): React.JSX.Element {
  const undoStack = useEditorStore((s) => s.undoStack);
  const redoStack = useEditorStore((s) => s.redoStack);
  const popUndo = useEditorStore((s) => s.popUndo);
  const popRedo = useEditorStore((s) => s.popRedo);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);

  const handleUndo = (): void => {
    const cmd = popUndo();
    if (cmd) {
      cmd.revert();
    }
  };

  const handleRedo = (): void => {
    const cmd = popRedo();
    if (cmd) {
      cmd.apply();
    }
  };

  return (
    <header className="flex h-10 shrink-0 items-center gap-1 border-b border-border bg-bg-sidebar px-2">
      <span className="px-2 text-sm font-semibold">MarkFlow</span>
      <div className="mx-2 h-5 w-px bg-border" />
      <button
        type="button"
        className="rounded px-2 py-1 text-xs hover:bg-border/40 disabled:opacity-40"
        disabled={undoStack.length === 0}
        onClick={handleUndo}
        title="Undo (Ctrl+Z)"
      >
        Undo
      </button>
      <button
        type="button"
        className="rounded px-2 py-1 text-xs hover:bg-border/40 disabled:opacity-40"
        disabled={redoStack.length === 0}
        onClick={handleRedo}
        title="Redo (Ctrl+Y)"
      >
        Redo
      </button>
      <div className="mx-2 h-5 w-px bg-border" />
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
