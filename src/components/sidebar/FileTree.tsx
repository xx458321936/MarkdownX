import type { FileNode } from '@/types';

interface Props {
  node: FileNode;
  depth: number;
  filter: string;
}

export function TreeNode({ node, depth, filter }: Props): React.JSX.Element {
  return (
    <div>
      <TreeRow node={node} depth={depth} filter={filter} />
      {node.isDir && node.children.length > 0 && (
        <ChildrenList node={node} depth={depth} filter={filter} />
      )}
    </div>
  );
}

function ChildrenList({ node, depth, filter }: { node: FileNode; depth: number; filter: string }): React.JSX.Element {
  const expanded = useIsExpanded(node.id);
  if (!expanded) return <></>;
  return (
    <div>
      {node.children.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} filter={filter} />
      ))}
    </div>
  );
}

import { useEditorStore } from '@/store/editor-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useUIStore } from '@/store/ui-store';
import { isMarkdownName, deleteEntry, renameEntry, moveEntry, createFile, createFolder } from '@/services/file-service';
import { openFile } from '@/services/file-open-service';
import { useDraggableNode, useDropTarget } from '@/hooks/use-dnd';
import { useState } from 'react';

export function FileTree({ filter }: { filter: string }): React.JSX.Element {
  const tree = useWorkspaceStore((s) => s.tree);
  if (!tree) return <div className="text-xs text-fg-muted">Empty workspace</div>;
  if (filter) {
    const filtered: FileNode = { ...tree, children: filterTree(tree.children, filter) };
    if (filtered.children.length === 0) {
      return <div className="text-xs text-fg-muted">No matches</div>;
    }
    return (
      <div>
        {filtered.children.map((child) => (
          <TreeNode key={child.id} node={child} depth={0} filter={filter} />
        ))}
      </div>
    );
  }
  return (
    <div>
      <TreeNode node={tree} depth={0} filter={filter} />
    </div>
  );
}

function filterTree(nodes: FileNode[], filter: string): FileNode[] {
  const out: FileNode[] = [];
  for (const node of nodes) {
    if (node.isDir) {
      const children = filterTree(node.children, filter);
      if (children.length > 0 || node.name.toLowerCase().includes(filter)) {
        out.push({ ...node, children });
      }
    } else if (node.name.toLowerCase().includes(filter)) {
      out.push(node);
    }
  }
  return out;
}

function useIsExpanded(id: string): boolean {
  const expanded = useWorkspaceStore((s) => s.expanded);
  return expanded.has(id);
}

function TreeRow({ node, depth, filter: _filter }: Props): React.JSX.Element {
  const expanded = useIsExpanded(node.id);
  const toggleExpanded = useWorkspaceStore((s) => s.toggleExpanded);
  const expand = useWorkspaceStore((s) => s.expand);
  const currentFilePath = useEditorStore((s) => s.currentFilePath);
  const showConfirm = useUIStore((s) => s.showConfirm);
  const pushToast = useUIStore((s) => s.pushToast);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.name);

  const draggable = useDraggableNode(node);
  const dropTarget = useDropTarget(node);

  const isActive = node.path === currentFilePath;

  const onClick = (): void => {
    if (node.isDir) {
      toggleExpanded(node.id);
    } else if (isMarkdownName(node.name)) {
      void openFile(node.path);
    }
  };

  const onContext = (e: React.MouseEvent): void => {
    e.preventDefault();
    const items: Array<{ label: string; onClick: () => void; destructive?: boolean }> = [];
    if (node.isDir) {
      items.push({
        label: 'New File',
        onClick: () => {
          void createFile(node.path);
        },
      });
      items.push({
        label: 'New Folder',
        onClick: () => {
          void createFolder(node.path);
        },
      });
    }
    items.push({ label: 'Rename', onClick: () => setEditing(true) });
    items.push({
      label: 'Delete',
      destructive: true,
      onClick: () => {
        showConfirm({
          title: `Delete ${node.name}?`,
          message: 'This cannot be undone.',
          confirmText: 'Delete',
          destructive: true,
          onConfirm: () => {
            void deleteEntry(node.path);
          },
        });
      },
    });
    showContextMenu(e.clientX, e.clientY, items);
  };

  const submitRename = async (): Promise<void> => {
    const value = editValue.trim();
    if (!value || value === node.name) {
      setEditing(false);
      return;
    }
    const result = await renameEntry(node.path, value);
    if (!result) {
      pushToast({ message: 'Rename failed', kind: 'error', duration: 2000 });
    }
    setEditing(false);
  };

  return (
    <div
      {...draggable}
      {...dropTarget}
      className={`group flex items-center rounded text-xs hover:bg-border/40 ${
        isActive ? 'bg-accent/15 text-fg' : ''
      } ${dropTarget.className ?? ''}`}
      style={{ paddingLeft: depth * 12 + 4 }}
      onClick={onClick}
      onContextMenu={onContext}
      onDragEnter={dropTarget.onDragEnter}
      onDragOver={dropTarget.onDragOver}
      onDragLeave={dropTarget.onDragLeave}
      onDrop={async (e) => {
        const source = e.dataTransfer.getData('text/plain');
        if (!source || source === node.path) return;
        const target = node.isDir ? node.path : node.path.replace(/[\\/][^\\/]+$/, '');
        if (target === source) return;
        if (target.startsWith(source + '/') || target.startsWith(source + '\\')) return;
        await moveEntry(source, target);
        expand(target);
      }}
    >
      <span className="mr-1 w-3 shrink-0 text-fg-muted">
        {node.isDir ? (expanded ? '▾' : '▸') : ''}
      </span>
      {editing ? (
        <input
          autoFocus
          className="flex-1 rounded border border-accent bg-bg px-1 py-0.5 text-xs outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={() => void submitRename()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void submitRename();
            if (e.key === 'Escape') setEditing(false);
          }}
        />
      ) : (
        <span className="flex-1 truncate">{node.name}</span>
      )}
    </div>
  );
}

function showContextMenu(
  x: number,
  y: number,
  items: Array<{ label: string; onClick: () => void; destructive?: boolean }>,
): void {
  const existing = document.getElementById('tree-context-menu');
  if (existing) existing.remove();
  const menu = document.createElement('div');
  menu.id = 'tree-context-menu';
  menu.className = 'fixed z-50 min-w-[160px] rounded border border-border bg-bg py-1 shadow-lg';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = `block w-full px-3 py-1 text-left text-xs hover:bg-border/40 ${
      item.destructive ? 'text-red-500' : ''
    }`;
    btn.textContent = item.label;
    btn.onclick = (): void => {
      item.onClick();
      menu.remove();
    };
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  const close = (): void => {
    menu.remove();
    document.removeEventListener('click', close);
  };
  setTimeout(() => document.addEventListener('click', close), 0);
}
