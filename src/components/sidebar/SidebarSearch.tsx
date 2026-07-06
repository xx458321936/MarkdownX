interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function SidebarSearch({ value, onChange }: Props): React.JSX.Element {
  return (
    <div className="border-b border-border px-2 py-1.5">
      <input
        type="text"
        placeholder="Filter files…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-border bg-bg px-2 py-1 text-xs outline-none focus:border-accent"
      />
    </div>
  );
}
