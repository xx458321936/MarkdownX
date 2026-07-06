import { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useUIStore } from '@/store/ui-store';
import { openWorkspace } from '@/services/workspace-service';
import { createFile, createFolder } from '@/services/file-service';

export function WorkspaceHeader({ onRefresh }: { onRefresh: () => void }): React.JSX.Element {
  const current = useWorkspaceStore((s) => s.current);
  const showConfirm = useUIStore((s) => s.showConfirm);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNewFile = async (): Promise<void> => {
    if (!current) return;
    const created = await createFile(current.path);
    if (created) {
      useUIStore.getState().pushToast({ message: 'File created', kind: 'success', duration: 2000 });
    }
    setMenuOpen(false);
  };

  const handleNewFolder = async (): Promise<void> => {
    if (!current) return;
    const created = await createFolder(current.path);
    if (created) {
      useUIStore.getState().pushToast({
        message: 'Folder created',
        kind: 'success',
        duration: 2000,
      });
    }
    setMenuOpen(false);
  };

  const handleClose = (): void => {
    if (!current) return;
    showConfirm({
      title: 'Close workspace?',
      message: 'Unsaved files will be lost.',
      confirmText: 'Close',
      destructive: true,
      onConfirm: () => {
        useWorkspaceStore.getState().setCurrent(null);
        useWorkspaceStore.getState().setTree(null);
      },
    });
  };

  return (
    <div className="flex h-9 items-center justify-between border-b border-border px-2">
      <span className="truncate text-xs font-medium" title={current?.path ?? ''}>
        {current?.name ?? 'MarkFlow'}
      </span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className="rounded px-1.5 py-0.5 text-xs hover:bg-border/40"
          onClick={() => void openWorkspace()}
          title="Open workspace"
        >
          Open
        </button>
        <button
          type="button"
          className="rounded px-1.5 py-0.5 text-xs hover:bg-border/40 disabled:opacity-40"
          disabled={!current}
          onClick={onRefresh}
          title="Refresh"
        >
          ⟳
        </button>
        <div className="relative">
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-xs hover:bg-border/40 disabled:opacity-40"
            disabled={!current}
            onClick={() => setMenuOpen((v) => !v)}
            title="New"
          >
            + New
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-10 mt-1 w-40 rounded border border-border bg-bg shadow-lg">
              <button
                type="button"
                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-border/40"
                onClick={() => void handleNewFile()}
              >
                New File
              </button>
              <button
                type="button"
                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-border/40"
                onClick={() => void handleNewFolder()}
              >
                New Folder
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          className="rounded px-1.5 py-0.5 text-xs hover:bg-border/40 disabled:opacity-40"
          disabled={!current}
          onClick={handleClose}
          title="Close workspace"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
