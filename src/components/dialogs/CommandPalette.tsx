import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useSearch } from '@/services/search-service';
import { openFile } from '@/services/file-open-service';

export function CommandPalette(): React.JSX.Element | null {
  const open = useUIStore((s) => s.showCommandPalette);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = useState('');
  const { results, isSearching } = useSearch(query, false);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 pt-24">
      <div className="w-[560px] max-w-[92%] overflow-hidden rounded-lg border border-border bg-bg shadow-lg">
        <div className="border-b border-border px-3 py-2">
          <input
            autoFocus
            type="text"
            placeholder="Quick open file…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <ul className="max-h-[420px] overflow-auto">
          {results.length === 0 && !isSearching && (
            <li className="px-3 py-3 text-xs text-fg-muted">Type to search</li>
          )}
          {results.map((r) => (
            <li key={r.path}>
              <button
                type="button"
                onClick={() => {
                  if (!r.isDir) {
                    void openFile(r.path);
                  }
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-xs hover:bg-border/40"
              >
                <div className="truncate font-medium">{r.name}</div>
                <div className="truncate text-fg-muted">{r.path}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
