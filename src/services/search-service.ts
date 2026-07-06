import { useEffect, useState } from 'react';
import { isTauri, tauri } from '@/services/tauri';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useUIStore } from '@/store/ui-store';
import type { SearchHit } from '@/types';

interface SearchHitRaw {
  path: string;
  name: string;
  is_dir: boolean;
  line: number | null;
  snippet: string | null;
}

const normalize = (raw: SearchHitRaw): SearchHit => ({
  path: raw.path,
  name: raw.name,
  isDir: raw.is_dir,
  line: raw.line,
  snippet: raw.snippet,
});

export function useSearch(query: string, content: boolean): {
  results: SearchHit[];
  isSearching: boolean;
} {
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isSearching, setSearching] = useState(false);

  useEffect(() => {
    const root = useWorkspaceStore.getState().current?.path;
    if (!root || !query.trim()) {
      setResults([]);
      return undefined;
    }
    setSearching(true);
    const handle = setTimeout(() => {
      if (!isTauri()) {
        setResults([]);
        setSearching(false);
        return;
      }
      tauri
        .searchFiles(root, query, content)
        .then((hits) => {
          setResults(hits.map(normalize));
        })
        .catch((err) => {
          useUIStore.getState().pushToast({
            message: `Search failed: ${String(err)}`,
            kind: 'error',
            duration: 2500,
          });
          setResults([]);
        })
        .finally(() => setSearching(false));
    }, 150);
    return () => clearTimeout(handle);
  }, [query, content]);

  return { results, isSearching };
}
