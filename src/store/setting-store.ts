import { create } from 'zustand';
import type { ThemeSettings } from '@/types';
import { isTauri, tauri } from '@/services/tauri';

interface SettingState {
  settings: ThemeSettings;
  loaded: boolean;
  applyTheme: () => void;
  applyFont: () => void;
  setSettings: (s: Partial<ThemeSettings>) => void;
  loadFromStorage: () => Promise<void>;
  persist: () => Promise<void>;
}

const DEFAULT_SETTINGS: ThemeSettings = {
  theme: 'light',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 15,
  tabSize: 2,
  autoSaveDelay: 500,
  defaultWorkspace: null,
};

export const useSettingStore = create<SettingState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  applyTheme: () => {
    const { theme } = get().settings;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  applyFont: () => {
    const { fontFamily, fontSize } = get().settings;
    document.documentElement.style.setProperty('--font-sans', fontFamily);
    document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
  },
  setSettings: (partial) => {
    set((s) => ({ settings: { ...s.settings, ...partial } }));
    get().applyTheme();
    get().applyFont();
    void get().persist();
  },
  loadFromStorage: async () => {
    if (get().loaded) return;
    try {
      if (!isTauri()) {
        set({ loaded: true });
        return;
      }
      const raw = await tauri.loadSettings();
      const parsed = raw ? (JSON.parse(raw) as Partial<ThemeSettings>) : {};
      set({ settings: { ...DEFAULT_SETTINGS, ...parsed }, loaded: true });
    } catch (err) {
      console.warn('Failed to load settings:', err);
      set({ loaded: true });
    }
    get().applyTheme();
    get().applyFont();
  },
  persist: async () => {
    try {
      if (!isTauri()) return;
      await tauri.saveSettings(JSON.stringify(get().settings, null, 2));
    } catch (err) {
      console.warn('Failed to persist settings:', err);
    }
  },
}));
