import { useUIStore } from '@/store/ui-store';
import { useSettingStore } from '@/store/setting-store';

const FONT_FAMILIES = [
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace', value: 'ui-monospace, "SF Mono", Menlo, monospace' },
];

export function SettingsDialog(): React.JSX.Element | null {
  const open = useUIStore((s) => s.showSettings);
  const setOpen = useUIStore((s) => s.setSettingsOpen);
  const settings = useSettingStore((s) => s.settings);
  const setSettings = useSettingStore((s) => s.setSettings);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-[480px] max-w-[92%] overflow-hidden rounded-lg border border-border bg-bg shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Settings</h2>
          <button
            type="button"
            className="rounded px-2 py-0.5 text-xs hover:bg-border/40"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-3 p-4 text-sm">
          <Row label="Theme">
            <select
              className="rounded border border-border bg-bg px-2 py-1 text-xs"
              value={settings.theme}
              onChange={(e) =>
                setSettings({ theme: e.target.value as 'light' | 'dark' })
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Row>
          <Row label="Font">
            <select
              className="rounded border border-border bg-bg px-2 py-1 text-xs"
              value={settings.fontFamily}
              onChange={(e) => setSettings({ fontFamily: e.target.value })}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Font size">
            <input
              type="number"
              min={10}
              max={32}
              value={settings.fontSize}
              onChange={(e) => setSettings({ fontSize: Number(e.target.value) || 15 })}
              className="w-20 rounded border border-border bg-bg px-2 py-1 text-xs"
            />
          </Row>
          <Row label="Tab size">
            <input
              type="number"
              min={1}
              max={8}
              value={settings.tabSize}
              onChange={(e) => setSettings({ tabSize: Number(e.target.value) || 2 })}
              className="w-20 rounded border border-border bg-bg px-2 py-1 text-xs"
            />
          </Row>
          <Row label="Auto-save delay (ms)">
            <input
              type="number"
              min={100}
              max={5000}
              step={100}
              value={settings.autoSaveDelay}
              onChange={(e) =>
                setSettings({ autoSaveDelay: Number(e.target.value) || 500 })
              }
              className="w-24 rounded border border-border bg-bg px-2 py-1 text-xs"
            />
          </Row>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs text-fg-muted">{label}</span>
      {children}
    </label>
  );
}
