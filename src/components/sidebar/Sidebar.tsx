import { useEffect, useMemo, useState } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';
import { openWorkspace, refreshTree } from '@/services/workspace-service';
import { FileTree } from '@/components/sidebar/FileTree';
import { WorkspaceHeader } from '@/components/sidebar/WorkspaceHeader';
import { SidebarSearch } from '@/components/sidebar/SidebarSearch';
import { useFileWatcher } from '@/hooks/use-file-watcher';
import { useFileActions } from '@/hooks/use-file-actions';

export function Sidebar(): React.JSX.Element {
  const current = useWorkspaceStore((s) => s.current);
  const recent = useWorkspaceStore((s) => s.recent);
  const [filter, setFilter] = useState('');
  useFileWatcher();
  useFileActions();

  const trimmed = filter.trim().toLowerCase();
  const isFiltering = trimmed.length > 0;

  useEffect(() => {
    if (current) {
      useWorkspaceStore.getState().expand(current.path);
    }
  }, [current]);

  const emptyState = useMemo(
    () => ({
      onOpen: () => {
        void openWorkspace();
      },
    }),
    [],
  );

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-bg-sidebar">
      <WorkspaceHeader onRefresh={() => void refreshTree()} />
      {current ? (
        <>
          <SidebarSearch value={filter} onChange={setFilter} />
          {isFiltering ? (
            <div className="px-3 py-2 text-xs text-fg-muted">Filtering by "{filter}"</div>
          ) : (
            <RecentList recent={recent} onOpen={(p) => void openWorkspace(p)} />
          )}
          <div className="flex-1 overflow-auto px-2 py-2">
            <FileTree filter={trimmed} />
          </div>
        </>
      ) : (
        <EmptyState {...emptyState} />
      )}
    </aside>
  );
}

function EmptyState({ onOpen }: { onOpen: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center text-sm text-fg-muted">
      <div>No workspace opened</div>
      <button
        type="button"
        className="rounded bg-accent px-3 py-1 text-xs text-white hover:opacity-90"
        onClick={onOpen}
      >
        Open Workspace
      </button>
    </div>
  );
}

function RecentList({
  recent,
  onOpen,
}: {
  recent: { path: string; name: string }[];
  onOpen: (path: string) => void;
}): React.JSX.Element {
  if (recent.length === 0) {
    return <div className="px-3 py-2 text-xs text-fg-muted">No recent workspaces</div>;
  }
  return (
    <div className="border-b border-border px-2 py-2 text-xs">
      <div className="mb-1 px-1 text-fg-muted">Recent</div>
      <ul className="space-y-0.5">
        {recent.slice(0, 5).map((r) => (
          <li key={r.path}>
            <button
              type="button"
              onClick={() => onOpen(r.path)}
              className="block w-full truncate rounded px-2 py-1 text-left text-fg hover:bg-border/40"
              title={r.path}
            >
              {r.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
