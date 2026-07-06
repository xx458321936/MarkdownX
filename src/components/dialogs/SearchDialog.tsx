import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useSearch } from '@/services/search-service';
import { openFile } from '@/services/file-open-service';

export function SearchDialog(): React.JSX.Element | null {
  const open = useUIStore((s) => s.showSearch);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const [query, setQuery] = useState('');
  const [content, setContent] = useState(true);
  const { results, isSearching } = useSearch(query, content);

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
      <div className="w-[640px] max-w-[92%] overflow-hidden rounded-lg border border-border bg-bg shadow-lg">
        <div className="border-b border-border px-3 py-2">
          <input
            autoFocus
            type="text"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2 border-b border-border px-3 py-1 text-xs text-fg-muted">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={content}
              onChange={(e) => setContent(e.target.checked)}
            />
            Search file contents
          </label>
          <span className="ml-auto">{isSearching ? 'Searching…' : `${results.length} results`}</span>
        </div>
        <ul className="max-h-[420px] overflow-auto">
          {results.length === 0 && !isSearching && (
            <li className="px-3 py-3 text-xs text-fg-muted">No results</li>
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
                {r.snippet && (
                  <div className="mt-0.5 truncate text-fg-muted">
                    {r.line ? `L${r.line}: ` : ''}
                    {r.snippet}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
