import { useEffect } from 'react';

// Browser-native textarea undo/redo handles Ctrl+Z / Ctrl+Y.
// This hook is reserved for app-wide shortcuts (workspace, settings, etc.)
// that don't conflict with the editor's native behavior.
export function useGlobalHotkeys(): void {
  useEffect(() => {
    /* noop for now */
    return undefined;
  }, []);
}
