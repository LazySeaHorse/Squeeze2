import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../stores/appStore';
import { codeContent, getContent } from '../../content';
import { AnimatedCode } from '../AnimatedCode';
import { ScrollArea } from '../ui/scroll-area';
import {
  ChevronRight,
  ChevronDown,
  FileCode2,
  FileJson,
  FileText,
  FileType,
  Folder,
  FolderOpen,
  FolderTree,
} from 'lucide-react';

// ── File metadata (for explorer display only) ───────────────────────────

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  language: string;
  icon: 'tsx' | 'ts' | 'css' | 'json' | 'md';
  dynamic: boolean; // true = real content that changes with level
}

const PROJECT_FILES: ProjectFile[] = [
  { id: 'app',      name: 'App.tsx',      path: 'src/App.tsx',                    language: 'typescriptreact', icon: 'tsx', dynamic: false },
  { id: 'todolist', name: 'TodoList.tsx',  path: 'src/components/TodoList.tsx',     language: 'typescriptreact', icon: 'tsx', dynamic: true  },
  { id: 'todoitem', name: 'TodoItem.tsx',  path: 'src/components/TodoItem.tsx',     language: 'typescriptreact', icon: 'tsx', dynamic: false },
  { id: 'usetodos', name: 'useTodos.ts',  path: 'src/hooks/useTodos.ts',          language: 'typescript',      icon: 'ts',  dynamic: false },
  { id: 'types',    name: 'types.ts',     path: 'src/types.ts',                   language: 'typescript',      icon: 'ts',  dynamic: false },
  { id: 'styles',   name: 'App.css',      path: 'src/styles/App.css',             language: 'css',             icon: 'css', dynamic: false },
  { id: 'package',  name: 'package.json', path: 'package.json',                   language: 'json',            icon: 'json',dynamic: false },
  { id: 'readme',   name: 'README.md',    path: 'README.md',                      language: 'markdown',        icon: 'md',  dynamic: false },
];

// ── File tree structure ─────────────────────────────────────────────────

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  fileId?: string;
  children?: TreeNode[];
}

const FILE_TREE: TreeNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      { name: 'App.tsx', type: 'file', fileId: 'app' },
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'TodoList.tsx', type: 'file', fileId: 'todolist' },
          { name: 'TodoItem.tsx', type: 'file', fileId: 'todoitem' },
        ],
      },
      {
        name: 'hooks',
        type: 'folder',
        children: [
          { name: 'useTodos.ts', type: 'file', fileId: 'usetodos' },
        ],
      },
      {
        name: 'styles',
        type: 'folder',
        children: [
          { name: 'App.css', type: 'file', fileId: 'styles' },
        ],
      },
      { name: 'types.ts', type: 'file', fileId: 'types' },
    ],
  },
  { name: 'package.json', type: 'file', fileId: 'package' },
  { name: 'README.md', type: 'file', fileId: 'readme' },
];

// ── File icon component ─────────────────────────────────────────────────

function FileIcon({ type, size = 14 }: { type: string; size?: number }) {
  switch (type) {
    case 'tsx':
      return <FileCode2 size={size} className="text-blue-400 shrink-0" />;
    case 'ts':
      return <FileCode2 size={size} className="text-sky-400 shrink-0" />;
    case 'css':
      return <FileType size={size} className="text-purple-400 shrink-0" />;
    case 'json':
      return <FileJson size={size} className="text-yellow-400 shrink-0" />;
    case 'md':
      return <FileText size={size} className="text-gray-400 shrink-0" />;
    default:
      return <FileText size={size} className="text-gray-400 shrink-0" />;
  }
}

// ── File tree node ──────────────────────────────────────────────────────

function TreeNodeItem({
  node,
  depth,
  activeFileId,
  expandedFolders,
  onFileClick,
  onToggleFolder,
}: {
  node: TreeNode;
  depth: number;
  activeFileId: string;
  expandedFolders: Set<string>;
  onFileClick: (fileId: string) => void;
  onToggleFolder: (path: string) => void;
}) {
  const paddingLeft = 12 + depth * 14;

  if (node.type === 'folder') {
    const folderPath = `${depth}-${node.name}`;
    const isExpanded = expandedFolders.has(folderPath);
    return (
      <>
        <button
          onClick={() => onToggleFolder(folderPath)}
          className="w-full flex items-center gap-1.5 py-[4px] hover:bg-white/[0.04] transition-colors"
          style={{ paddingLeft }}
        >
          {isExpanded ? (
            <ChevronDown size={12} style={{ color: 'var(--sq-text-3)' }} />
          ) : (
            <ChevronRight size={12} style={{ color: 'var(--sq-text-3)' }} />
          )}
          {isExpanded ? (
            <FolderOpen size={14} className="text-amber-400 shrink-0" />
          ) : (
            <Folder size={14} className="text-amber-400 shrink-0" />
          )}
          <span className="text-[12px] truncate" style={{ color: 'var(--sq-text-2)' }}>
            {node.name}
          </span>
        </button>
        {isExpanded &&
          node.children?.map((child, i) => (
            <TreeNodeItem
              key={`${folderPath}-${child.name}-${i}`}
              node={child}
              depth={depth + 1}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              onFileClick={onFileClick}
              onToggleFolder={onToggleFolder}
            />
          ))}
      </>
    );
  }

  const file = PROJECT_FILES.find((f) => f.id === node.fileId);
  if (!file) return null;
  const isActive = activeFileId === file.id;
  const isDummy = !file.dynamic;

  if (isDummy) {
    // Dummy file — visible but not clickable
    return (
      <div
        className="w-full flex items-center gap-1.5 py-[4px]"
        style={{
          paddingLeft: paddingLeft + 16,
          opacity: 0.35,
          color: 'var(--sq-text-4)',
        }}
      >
        <FileIcon type={file.icon} size={13} />
        <span className="text-[12px] truncate">{node.name}</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => onFileClick(file.id)}
      className="w-full flex items-center gap-1.5 py-[4px] transition-colors"
      style={{
        paddingLeft: paddingLeft + 16,
        background: isActive ? 'var(--sq-surface-active)' : 'transparent',
        color: isActive ? 'var(--sq-text)' : 'var(--sq-text-3)',
      }}
    >
      <FileIcon type={file.icon} size={13} />
      <span className="text-[12px] truncate">{node.name}</span>
    </button>
  );
}

// ── Explorer panel ──────────────────────────────────────────────────────

function ExplorerPanel({
  activeFileId,
  expandedFolders,
  onFileClick,
  onToggleFolder,
}: {
  activeFileId: string;
  expandedFolders: Set<string>;
  onFileClick: (fileId: string) => void;
  onToggleFolder: (path: string) => void;
}) {
  return (
    <>
      {/* Sidebar header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--sq-border)' }}
      >
        <span
          className="text-[11px] uppercase tracking-wider"
          style={{ color: 'var(--sq-text-3)', fontWeight: 600 }}
        >
          Explorer
        </span>
      </div>

      {/* Project name */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 shrink-0"
        style={{ borderBottom: '1px solid var(--sq-border)' }}
      >
        <ChevronDown size={12} style={{ color: 'var(--sq-text-3)' }} />
        <span
          className="text-[11px] uppercase tracking-wider"
          style={{ color: 'var(--sq-text-2)', fontWeight: 600 }}
        >
          react-todo-app
        </span>
      </div>

      {/* File tree */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {FILE_TREE.map((node, i) => (
            <TreeNodeItem
              key={`root-${node.name}-${i}`}
              node={node}
              depth={0}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              onFileClick={onFileClick}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Dummy file note */}
      <div
        className="px-3 py-2 shrink-0"
        style={{ borderTop: '1px solid var(--sq-border)' }}
      >
        <span className="text-[10px]" style={{ color: 'var(--sq-text-5)' }}>
          Dimmed files are scaffolding for the demo.
        </span>
      </div>
    </>
  );
}

// ── Main CodeTab component ──────────────────────────────────────────────

export function CodeTab() {
  const currentLevel = useAppStore((s) => s.currentLevel);

  // Explorer state (no multi-tab — only todolist is openable)
  const activeFileId = 'todolist';
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => new Set(['0-src', '1-components', '1-hooks', '1-styles'])
  );
  const [mobileExplorerOpen, setMobileExplorerOpen] = useState(false);

  const handleFileClick = useCallback((_fileId: string) => {
    // Only todolist is openable — ignore clicks on dummy files
    setMobileExplorerOpen(false);
  }, []);

  const handleToggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  // Resolve content — tone is ignored for code tab
  const activeFile = PROJECT_FILES.find((f) => f.id === activeFileId)!;
  const dynamicText = getContent(codeContent, currentLevel, 'normal');
  const lineCount = dynamicText.split('\n').length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── IDE Container ─────────────────────────────────────────── */}
      <div
        className="flex flex-1 min-h-0 overflow-hidden md:rounded-lg"
        style={{
          border: '1px solid var(--sq-border)',
          background: 'var(--sq-code-bg)',
        }}
      >
        {/* ── Desktop Sidebar (anchored — does not scroll with editor) */}
        <div
          className="hidden md:flex flex-col shrink-0"
          style={{
            width: '240px',
            borderRight: '1px solid var(--sq-border)',
            background: 'var(--sq-bg)',
          }}
        >
          <ExplorerPanel
            activeFileId={activeFileId}
            expandedFolders={expandedFolders}
            onFileClick={handleFileClick}
            onToggleFolder={handleToggleFolder}
          />
        </div>

        {/* ── Editor area ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Anchored file header (replaces tab bar) */}
          <div
            className="flex items-center shrink-0"
            style={{
              borderBottom: '1px solid var(--sq-border)',
              background: 'var(--sq-bg)',
            }}
          >
            <div
              className="flex items-center gap-1.5 px-3 py-2 shrink-0"
              style={{
                borderBottom: '2px solid var(--sq-accent)',
                background: 'var(--sq-code-bg)',
                color: 'var(--sq-text)',
              }}
            >
              <FileIcon type={activeFile.icon} size={13} />
              <span className="text-[12px] whitespace-nowrap">{activeFile.name}</span>
              {currentLevel !== 0 && (
                <span
                  className="ml-1 text-[9px] px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--sq-surface-hover)',
                    color: 'var(--sq-accent)',
                  }}
                >
                  L{currentLevel}
                </span>
              )}
            </div>
          </div>

          {/* Anchored breadcrumb */}
          <div
            className="flex items-center gap-1 px-4 py-1.5 shrink-0"
            style={{
              borderBottom: '1px solid var(--sq-border)',
              background: 'var(--sq-code-bg)',
            }}
          >
            {activeFile.path.split('/').map((segment, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight size={10} style={{ color: 'var(--sq-text-5)' }} />
                )}
                <span
                  className="text-[11px]"
                  style={{
                    color: i === arr.length - 1 ? 'var(--sq-text)' : 'var(--sq-text-4)',
                  }}
                >
                  {segment}
                </span>
              </span>
            ))}
          </div>

          {/* ── Scrollable code editor ─────────────────────────── */}
          <ScrollArea className="flex-1 min-h-0">
            <AnimatedCode
              text={dynamicText}
              className="p-4 font-mono text-[12px] overflow-x-auto whitespace-pre-wrap"
              style={{ lineHeight: '1.8', tabSize: 2, color: 'var(--sq-text-2)' }}
            />
          </ScrollArea>

          {/* Anchored status bar */}
          <div
            className="hidden md:flex items-center justify-between px-3 py-1 shrink-0"
            style={{
              borderTop: '1px solid var(--sq-border)',
              background: 'var(--sq-bg)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-[11px]" style={{ color: 'var(--sq-text-3)' }}>
                TypeScript React
              </span>
              <span className="text-[11px]" style={{ color: 'var(--sq-text-4)' }}>
                UTF-8
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px]" style={{ color: 'var(--sq-text-3)' }}>
                Ln {lineCount}, Col 1
              </span>
              <span className="text-[11px]" style={{ color: 'var(--sq-text-4)' }}>
                Spaces: 2
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile FAB ──────────────────────────────────────────── */}
      <button
        onClick={() => setMobileExplorerOpen(true)}
        className="md:hidden fixed z-50 right-4 bottom-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        style={{
          background: 'var(--sq-accent)',
          color: 'white',
        }}
      >
        <FolderTree size={20} />
      </button>

      {/* ── Mobile Explorer popup ───────────────────────────────── */}
      <AnimatePresence>
        {mobileExplorerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 z-50"
              style={{ background: 'var(--sq-overlay)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileExplorerOpen(false)}
            />
            {/* Panel */}
            <motion.div
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col"
              style={{
                background: 'var(--sq-bg)',
                borderTop: '1px solid var(--sq-border)',
                borderRadius: '16px 16px 0 0',
                maxHeight: '70vh',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            >
              {/* Handle */}
              <div className="flex items-center justify-center py-2 shrink-0">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: 'var(--sq-text-5)' }}
                />
              </div>
              <ExplorerPanel
                activeFileId={activeFileId}
                expandedFolders={expandedFolders}
                onFileClick={handleFileClick}
                onToggleFolder={handleToggleFolder}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
