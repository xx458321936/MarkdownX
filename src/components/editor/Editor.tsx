import { useEditorStore } from '@/store/editor-store';
import { useAutoSave } from '@/hooks/use-auto-save';
import { BlockView } from '@/components/editor/BlockView';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { SettingsDialog } from '@/components/dialogs/SettingsDialog';
import { SearchDialog } from '@/components/dialogs/SearchDialog';
import { CommandPalette } from '@/components/dialogs/CommandPalette';

export function Editor(): React.JSX.Element {
  const document = useEditorStore((s) => s.document);
  useAutoSave();

  return (
    <main className="flex h-full flex-1 flex-col overflow-hidden bg-bg">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-1 flex-col overflow-auto px-8 py-12">
        <article className="flex flex-col gap-3">
          {document.blocks.map((block) => (
            <BlockView key={block.id} block={block} />
          ))}
        </article>
      </div>
      <ConfirmDialog />
      <SettingsDialog />
      <SearchDialog />
      <CommandPalette />
    </main>
  );
}
