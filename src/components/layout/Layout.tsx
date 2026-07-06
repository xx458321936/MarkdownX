import { useEffect } from 'react';
import { useSettingStore } from '@/store/setting-store';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Editor } from '@/components/editor/Editor';
import { StatusBar } from '@/components/statusbar/StatusBar';
import { useGlobalHotkeys } from '@/hooks/use-global-hotkeys';

export function Layout(): React.JSX.Element {
  const loadFromStorage = useSettingStore((s) => s.loadFromStorage);
  useGlobalHotkeys();

  useEffect(() => {
    void loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="flex h-full w-full flex-col">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Editor />
      </div>
      <StatusBar />
    </div>
  );
}
