import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Plus, Trash2, Search, Sparkles, Copy, Check, FileText, ChevronLeft, X,
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Code, Quote, Minus, Link2, Eye, Pencil,
  SquareCode, AlertTriangle, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, LEVEL_LABELS, TONE_LABELS } from '../../stores/appStore';
import type { TonePreset } from '../../stores/appStore';
import { generateCompression } from '../../lib/ai';
import { Button } from '../ui/button';
import { buttonVariants } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { AnimatedText } from '../AnimatedText';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'squeeze-notes';

// ── Precomputed summary cache ─────────────────────────────────────────
type LevelStatus = 'idle' | 'loading' | 'done' | 'error';

interface LevelEntry {
  text: string;
  status: LevelStatus;
}

interface NoteCache {
  /** Hash of the source content that was summarised */
  contentHash: string;
  /** Tone used for this batch */
  tone: TonePreset;
  /** Summaries keyed by compression level (1–3; level 0 is always original) */
  levels: Record<1 | 2 | 3, LevelEntry>;
}

function emptyCache(hash: string, tone: TonePreset): NoteCache {
  return {
    contentHash: hash,
    tone,
    levels: {
      1: { text: '', status: 'idle' },
      2: { text: '', status: 'idle' },
      3: { text: '', status: 'idle' },
    },
  };
}

/** Cheap fingerprint so we know when note content changed. */
function hashContent(content: string): string {
  return `${content.length}:${content.slice(0, 200)}`;
}

function loadNotes(): Note[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    {
      id: 'default-1',
      title: '# Welcome to Squeeze Notes',
      content: `# Welcome to Squeeze Notes

This editor supports **full Markdown** with a live preview. Toggle between *write* and *preview* modes using the button in the toolbar.

## Features

- **Bold**, *italic*, and ~~strikethrough~~ text
- Headings from \`H1\` to \`H3\`
- Bullet lists and numbered lists
- Inline \`code\` and fenced code blocks
- [Links](https://example.com) and blockquotes
- Horizontal rules

## The James Webb Space Telescope

The **James Webb Space Telescope** (JWST) has revolutionized our understanding of the early universe. Launched on December 25, 2021, the telescope reached the Sun–Earth L2 Lagrange point roughly **1.5 million km** from Earth.

> JWST's primary mirror is 6.5 meters in diameter, composed of 18 hexagonal gold-plated beryllium segments — giving it ~6× the collecting area of Hubble.

### Key Discoveries

1. Galaxies forming just **300 million years** after the Big Bang
2. Unprecedented detail of exoplanet atmospheres
3. Detection of water vapor, CO₂, and other molecules indicating potential habitability

---

Use the **formatting toolbar** below the editor to quickly insert Markdown syntax, or just type it directly.`,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 3600000,
    },
    {
      id: 'default-2',
      title: '## Meeting Notes',
      content: `## Meeting Notes

**Project sync — March 2, 2026**

*Attendees:* Alex, Sam, Jordan, Maya

### Key Decisions

- Ship v2.0 by end of Q1
- Migrate auth to passkeys
- Deprecate legacy REST endpoints in favor of GraphQL
- Design review scheduled for Thursday

### Action Items

1. **Alex:** finalize API schema by Wednesday
2. **Sam:** set up staging environment
3. **Jordan:** update migration scripts
4. **Maya:** prepare design mockups for new dashboard

> Next meeting: Thursday 10am`,
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 1800000,
    },
    {
      id: 'default-3',
      title: '## Quick Ideas',
      content: `## Quick Ideas

- Build a CLI tool that compresses git diffs for code review
- Explore **WebGPU** for client-side inference
- Read *"Designing Data-Intensive Applications"*
- Try \`Bun\` as a Node replacement for the build pipeline
- Look into effect systems in TypeScript

\`\`\`ts
// example: streaming compression
const stream = await compress(input, { level: 3 });
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
\`\`\``,
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 600000,
    },
  ];
}

function saveNotes(notes: Note[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch {}
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Markdown renderer ─────────────────────────────────────────────────
function renderMarkdownPreview(src: string): React.ReactNode {
  const lines = src.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      nodes.push(
        <pre
          key={key++}
          className="rounded-lg p-4 my-3 overflow-x-auto text-[12px] font-mono"
          style={{ background: 'var(--sq-surface)', border: '1px solid var(--sq-border)', lineHeight: '1.7' }}
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      nodes.push(
        <hr key={key++} className="my-4" style={{ borderColor: 'var(--sq-border)' }} />
      );
      i++;
      continue;
    }

    // Headings
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      nodes.push(
        <h3 key={key++} className="text-[14px] mt-5 mb-2" style={{ fontWeight: 600, color: 'var(--sq-text)', lineHeight: '1.4' }}>
          {renderInlineMarkdown(h3[1])}
        </h3>
      );
      i++;
      continue;
    }
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      nodes.push(
        <h2 key={key++} className="text-[16px] mt-6 mb-2" style={{ fontWeight: 600, color: 'var(--sq-text)', lineHeight: '1.4' }}>
          {renderInlineMarkdown(h2[1])}
        </h2>
      );
      i++;
      continue;
    }
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      nodes.push(
        <h1 key={key++} className="text-[20px] mt-6 mb-3" style={{ fontWeight: 600, color: 'var(--sq-text)', lineHeight: '1.3' }}>
          {renderInlineMarkdown(h1[1])}
        </h1>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].trimStart().startsWith('>') || (lines[i].trim() !== '' && quoteLines.length > 0 && !lines[i].match(/^[#\-\d]/)))) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      nodes.push(
        <blockquote
          key={key++}
          className="my-3 py-2 px-4 text-[13px]"
          style={{
            borderLeft: '3px solid var(--sq-accent)',
            background: 'var(--sq-accent-dim)',
            borderRadius: '0 8px 8px 0',
            color: 'var(--sq-text-2)',
            lineHeight: '1.7',
          }}
        >
          {renderInlineMarkdown(quoteLines.join(' '))}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    if (/^[\-\*\+]\s/.test(line.trimStart())) {
      const items: string[] = [];
      while (i < lines.length && /^[\-\*\+]\s/.test(lines[i].trimStart())) {
        items.push(lines[i].trimStart().replace(/^[\-\*\+]\s+/, ''));
        i++;
      }
      nodes.push(
        <ul key={key++} className="my-2 space-y-1 pl-1">
          {items.map((item, ii) => (
            <li key={ii} className="flex gap-2 text-[13px]" style={{ lineHeight: '1.7', color: 'var(--sq-text-2)' }}>
              <span className="shrink-0 mt-[2px]" style={{ color: 'var(--sq-text-4)' }}>•</span>
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trimStart())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trimStart())) {
        items.push(lines[i].trimStart().replace(/^\d+\.\s+/, ''));
        i++;
      }
      nodes.push(
        <ol key={key++} className="my-2 space-y-1 pl-1">
          {items.map((item, ii) => (
            <li key={ii} className="flex gap-2 text-[13px]" style={{ lineHeight: '1.7', color: 'var(--sq-text-2)' }}>
              <span className="shrink-0 mt-[1px] text-[12px] tabular-nums" style={{ color: 'var(--sq-text-4)', minWidth: '18px' }}>{ii + 1}.</span>
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph — collect consecutive non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trimStart().startsWith('#') &&
      !lines[i].trimStart().startsWith('>') &&
      !lines[i].trimStart().startsWith('```') &&
      !/^[\-\*\+]\s/.test(lines[i].trimStart()) &&
      !/^\d+\.\s/.test(lines[i].trimStart()) &&
      !/^(-{3,}|_{3,}|\*{3,})$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      nodes.push(
        <p key={key++} className="my-2 text-[13px]" style={{ lineHeight: '1.7', color: 'var(--sq-text-2)' }}>
          {renderInlineMarkdown(paraLines.join(' '))}
        </p>
      );
    }
  }

  return nodes;
}

function renderInlineMarkdown(text: string): React.ReactNode {
  // Process inline elements: bold, italic, strikethrough, code, links
  const parts: React.ReactNode[] = [];
  // Order matters: bold before italic to avoid conflicts with **
  const regex = /(\*\*(.+?)\*\*|__(.+?)__|~~(.+?)~~|\*(.+?)\*|_(.+?)_|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;
  let k = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2] || match[3]) {
      // Bold
      parts.push(
        <span key={k++} style={{ fontWeight: 600, color: 'var(--sq-text)' }}>
          {match[2] || match[3]}
        </span>
      );
    } else if (match[4]) {
      // Strikethrough
      parts.push(
        <span key={k++} style={{ textDecoration: 'line-through', color: 'var(--sq-text-3)' }}>
          {match[4]}
        </span>
      );
    } else if (match[5] || match[6]) {
      // Italic
      parts.push(
        <em key={k++} style={{ fontStyle: 'italic' }}>
          {match[5] || match[6]}
        </em>
      );
    } else if (match[7]) {
      // Inline code
      parts.push(
        <code
          key={k++}
          className="text-[11.5px] px-1.5 py-0.5 rounded"
          style={{ background: 'var(--sq-surface-hover)', fontFamily: 'monospace', color: 'var(--sq-accent)' }}
        >
          {match[7]}
        </code>
      );
    } else if (match[8] && match[9]) {
      // Link
      parts.push(
        <a
          key={k++}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
          style={{ color: 'var(--sq-accent)' }}
        >
          {match[8]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ── Formatting helpers ────────────────────────────────────────────────

type FormatAction = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  action: (ta: HTMLTextAreaElement, content: string) => { content: string; selStart: number; selEnd: number };
};

function wrapSelection(
  ta: HTMLTextAreaElement,
  content: string,
  before: string,
  after: string,
): { content: string; selStart: number; selEnd: number } {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = content.slice(start, end);
  const placeholder = selected || 'text';
  const newContent = content.slice(0, start) + before + placeholder + after + content.slice(end);
  const selStart = start + before.length;
  const selEnd = selStart + placeholder.length;
  return { content: newContent, selStart, selEnd };
}

function prependLine(
  ta: HTMLTextAreaElement,
  content: string,
  prefix: string,
): { content: string; selStart: number; selEnd: number } {
  const start = ta.selectionStart;
  // Find beginning of current line
  const lineStart = content.lastIndexOf('\n', start - 1) + 1;
  const newContent = content.slice(0, lineStart) + prefix + content.slice(lineStart);
  const selStart = start + prefix.length;
  return { content: newContent, selStart, selEnd: selStart };
}

function insertAtCursor(
  ta: HTMLTextAreaElement,
  content: string,
  text: string,
): { content: string; selStart: number; selEnd: number } {
  const start = ta.selectionStart;
  const newContent = content.slice(0, start) + text + content.slice(start);
  const selStart = start + text.length;
  return { content: newContent, selStart, selEnd: selStart };
}

const FORMAT_ACTIONS: FormatAction[] = [
  { icon: Bold, label: 'Bold', shortcut: '⌘B', action: (ta, c) => wrapSelection(ta, c, '**', '**') },
  { icon: Italic, label: 'Italic', shortcut: '⌘I', action: (ta, c) => wrapSelection(ta, c, '*', '*') },
  { icon: Strikethrough, label: 'Strikethrough', action: (ta, c) => wrapSelection(ta, c, '~~', '~~') },
  { icon: Heading1, label: 'Heading 1', action: (ta, c) => prependLine(ta, c, '# ') },
  { icon: Heading2, label: 'Heading 2', action: (ta, c) => prependLine(ta, c, '## ') },
  { icon: Heading3, label: 'Heading 3', action: (ta, c) => prependLine(ta, c, '### ') },
  { icon: List, label: 'Bullet list', action: (ta, c) => prependLine(ta, c, '- ') },
  { icon: ListOrdered, label: 'Numbered list', action: (ta, c) => prependLine(ta, c, '1. ') },
  { icon: Code, label: 'Inline code', shortcut: '⌘E', action: (ta, c) => wrapSelection(ta, c, '`', '`') },
  { icon: SquareCode, label: 'Code block', action: (ta, c) => wrapSelection(ta, c, '```\n', '\n```') },
  { icon: Quote, label: 'Blockquote', action: (ta, c) => prependLine(ta, c, '> ') },
  { icon: Link2, label: 'Link', action: (ta, c) => {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = c.slice(start, end) || 'link text';
    const newContent = c.slice(0, start) + `[${selected}](url)` + c.slice(end);
    return { content: newContent, selStart: start + selected.length + 3, selEnd: start + selected.length + 6 };
  }},
  { icon: Minus, label: 'Horizontal rule', action: (ta, c) => insertAtCursor(ta, c, '\n---\n') },
];

// ── Main component ────────────────────────────────────────────────────

export function NotesTab() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const currentTone = useAppStore((s) => s.currentTone);
  const groqKey = useAppStore((s) => s.settings.groqKey);
  const openRouterKey = useAppStore((s) => s.settings.openRouterKey);

  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [search, setSearch] = useState('');
  const [showList, setShowList] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'write' | 'preview'>('preview');
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const getTextarea = (): HTMLTextAreaElement | null =>
    editorWrapRef.current?.querySelector('textarea') ?? null;

  const hasApiKey = !!(groqKey || openRouterKey);
  const activeNote = notes.find((n) => n.id === activeNoteId);

  // ── Precomputed AI summaries (preview mode only) ────────────────────
  const [summaryCache, setSummaryCache] = useState<Record<string, NoteCache>>({});
  const summaryCacheRef = useRef(summaryCache);
  summaryCacheRef.current = summaryCache;
  const precomputeAbortRef = useRef<AbortController | null>(null);

  /** Kick off 3 parallel AI calls (levels 1–3) for the given note. */
  const precomputeSummaries = useCallback(
    (noteId: string, content: string, tone: TonePreset) => {
      if (!content.trim()) return;

      const hash = hashContent(content);

      // Already cached for this content + tone? Skip.
      const existing = summaryCacheRef.current[noteId];
      if (
        existing &&
        existing.contentHash === hash &&
        existing.tone === tone &&
        existing.levels[1].status !== 'idle'
      ) {
        return;
      }

      // Cancel any in-flight precompute
      precomputeAbortRef.current?.abort();
      const abort = new AbortController();
      precomputeAbortRef.current = abort;

      // Seed the cache with loading states
      const fresh = emptyCache(hash, tone);
      fresh.levels[1].status = 'loading';
      fresh.levels[2].status = 'loading';
      fresh.levels[3].status = 'loading';
      setSummaryCache((prev) => ({ ...prev, [noteId]: fresh }));

      // Fire 3 calls in parallel
      ([1, 2, 3] as const).forEach((level) => {
        generateCompression(content, level, tone)
          .then((result) => {
            if (abort.signal.aborted) return;
            setSummaryCache((prev) => {
              const entry = prev[noteId];
              if (!entry || entry.contentHash !== hash) return prev;
              return {
                ...prev,
                [noteId]: {
                  ...entry,
                  levels: {
                    ...entry.levels,
                    [level]: result.error
                      ? { text: '', status: 'error' as const }
                      : { text: result.text, status: 'done' as const },
                  },
                },
              };
            });
          })
          .catch(() => {
            if (abort.signal.aborted) return;
            setSummaryCache((prev) => {
              const entry = prev[noteId];
              if (!entry || entry.contentHash !== hash) return prev;
              return {
                ...prev,
                [noteId]: {
                  ...entry,
                  levels: {
                    ...entry.levels,
                    [level]: { text: '', status: 'error' as const },
                  },
                },
              };
            });
          });
      });
    },
    [], // stable — reads cache via ref
  );

  // Trigger precompute when switching to preview (with an API key) or
  // when note selection changes while already in preview.
  const prevPreviewNoteRef = useRef<string>('');
  const prevPreviewHashRef = useRef<string>('');

  useEffect(() => {
    if (viewMode !== 'preview' || !activeNote || !hasApiKey) return;

    const hash = hashContent(activeNote.content);
    const noteChanged = activeNote.id !== prevPreviewNoteRef.current;
    const contentChanged = hash !== prevPreviewHashRef.current;

    if (noteChanged || contentChanged) {
      prevPreviewNoteRef.current = activeNote.id;
      prevPreviewHashRef.current = hash;
      precomputeSummaries(activeNote.id, activeNote.content, currentTone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeNoteId, activeNote?.content, hasApiKey, currentTone]);

  // Clean up abort on unmount
  useEffect(() => () => precomputeAbortRef.current?.abort(), []);

  // Derive what to show in preview for the current level
  const activeSummary = activeNote
    ? summaryCache[activeNote.id]
    : undefined;

  /** Get the text to display in preview for a given compression level. */
  function getPreviewText(): { text: string; status: LevelStatus; isError: boolean } {
    if (!activeNote) return { text: '', status: 'idle', isError: false };
    if (currentLevel === 0) return { text: '', status: 'done', isError: false };

    // No API key → error
    if (!hasApiKey) {
      return {
        text: 'AI summary unavailable — add a Groq or OpenRouter API key in Settings to enable squeeze compression.',
        status: 'error',
        isError: true,
      };
    }

    const level = currentLevel as 1 | 2 | 3;
    const entry = activeSummary?.levels[level];
    if (!entry || entry.status === 'idle') {
      return { text: '', status: 'loading', isError: false };
    }
    if (entry.status === 'loading') {
      return { text: '', status: 'loading', isError: false };
    }
    if (entry.status === 'error') {
      return {
        text: 'AI summary failed — check your API key and try again.',
        status: 'error',
        isError: true,
      };
    }
    return { text: entry.text, status: 'done', isError: false };
  }

  const previewSummary = getPreviewText();

  // Show sidebar by default on desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    if (mq.matches) setShowList(true);
  }, []);

  const isMobile = () => window.innerWidth < 768;

  useEffect(() => { saveNotes(notes); }, [notes]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)
    );
  }, []);

  const createNote = () => {
    const note: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
    setActiveNoteId(note.id);
    setShowList(false);
    setViewMode('write');
    setTimeout(() => getTextarea()?.focus(), 50);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      if (activeNoteId === id) {
        setActiveNoteId(next[0]?.id || '');
      }
      return next;
    });
  };

  const deriveTitle = (content: string): string => {
    const firstLine = content.split('\n')[0]?.trim();
    // Strip leading markdown heading markers for a clean title
    const cleaned = firstLine?.replace(/^#+\s*/, '').slice(0, 50);
    return cleaned || 'Untitled';
  };

  const handleContentChange = (content: string) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { content, title: deriveTitle(content) });
  };

  const handleFormat = (formatAction: FormatAction) => {
    const ta = getTextarea();
    if (!ta || !activeNote) return;
    const result = formatAction.action(ta, activeNote.content);
    handleContentChange(result.content);
    // Restore selection after React re-render
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(result.selStart, result.selEnd);
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (viewMode !== 'write' || !getTextarea() || !activeNote) return;

      let action: FormatAction | undefined;
      if (e.key === 'b') action = FORMAT_ACTIONS[0]; // Bold
      else if (e.key === 'i') action = FORMAT_ACTIONS[1]; // Italic
      else if (e.key === 'e') action = FORMAT_ACTIONS[8]; // Inline code
      else return;

      e.preventDefault();
      handleFormat(action);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeNote]);

  const handleGenerate = async () => {
    if (!activeNote?.content.trim() || isGenerating) return;
    setIsGenerating(true);
    setAiOutput('');

    try {
      const result = await generateCompression(
        activeNote.content,
        currentLevel,
        currentTone,
        hasApiKey ? (chunk) => setAiOutput(chunk) : undefined
      );
      if (result.error) {
        setAiOutput(`Error: ${result.error}`);
      } else {
        setAiOutput(result.text);
      }
    } catch (e: any) {
      setAiOutput(`Error: ${e.message}`);
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiOutput || activeNote?.content || '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const filtered = search
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  const wordCount = activeNote ? activeNote.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = activeNote ? activeNote.content.length : 0;

  // ── 3-phase preview animation ───────────────────────────────────────
  // Layer 1 (bottom): AnimatedText, always mounted, tracks text changes
  // Layer 2 (top):    Rendered markdown overlay, fades in/out
  //
  // Squeeze 0→1: fade out original markdown → AnimatedText diffs → fade in summary markdown
  // Squeeze 1→2: fade out summary L1 markdown → AnimatedText diffs → fade in summary L2 markdown
  // Unsqueeze:   reverse

  const [markdownFaded, setMarkdownFaded] = useState(false);
  const fadeBackTimerRef = useRef<ReturnType<typeof setTimeout>>();

  /** The flat text string AnimatedText receives at every level. */
  const animTextContent = useMemo(() => {
    if (!activeNote) return '';
    if (currentLevel === 0) return activeNote.content;
    if (previewSummary.status === 'done' && !previewSummary.isError) return previewSummary.text;
    return activeNote.content; // keep original during loading
  }, [activeNote, currentLevel, previewSummary.status, previewSummary.isError, previewSummary.text]);

  /** Rendered markdown for the overlay (original at L0, summary at L1+). */
  const overlayMarkdown = useMemo(() => {
    if (!activeNote) return null;
    if (currentLevel === 0) return renderMarkdownPreview(activeNote.content);
    if (previewSummary.status === 'done' && !previewSummary.isError) {
      return renderMarkdownPreview(previewSummary.text);
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote?.content, currentLevel, previewSummary.status, previewSummary.isError, previewSummary.text]);

  // Detect text changes and trigger the fade-out / fade-in cycle
  const prevAnimTextRef = useRef(animTextContent);
  const prevAnimLevelRef = useRef(currentLevel);

  useEffect(() => {
    if (viewMode !== 'preview') {
      // Keep refs in sync while not in preview — no animation
      prevAnimTextRef.current = animTextContent;
      prevAnimLevelRef.current = currentLevel;
      return;
    }

    const textChanged = prevAnimTextRef.current !== animTextContent;
    const levelChanged = prevAnimLevelRef.current !== currentLevel;
    prevAnimTextRef.current = animTextContent;
    prevAnimLevelRef.current = currentLevel;

    if (textChanged && (levelChanged || currentLevel > 0)) {
      // Phase 1: fade out markdown overlay to reveal AnimatedText diffing
      setMarkdownFaded(true);
      // Phase 3: after diff settles, fade overlay back in with new markdown
      clearTimeout(fadeBackTimerRef.current);
      fadeBackTimerRef.current = setTimeout(() => setMarkdownFaded(false), 1400);
    }
  }, [animTextContent, currentLevel, viewMode]);

  // Also trigger animation when level changes even if text hasn't arrived yet
  // (handles case where summary was already cached and text changed in same tick)
  useEffect(() => {
    return () => clearTimeout(fadeBackTimerRef.current);
  }, []);

  // Sidebar note title display: strip markdown heading markers
  const displayTitle = (note: Note) => note.title.replace(/^#+\s*/, '') || 'Untitled';

  return (
    <div className="flex gap-0 h-full min-h-0 flex-1 relative">
      {/* Sidebar - overlay on mobile, inline on desktop */}
      <AnimatePresence>
        {showList && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 md:hidden"
              style={{ background: 'rgba(0,0,0,0.3)' }}
              onClick={() => setShowList(false)}
            />
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.9 }}
              className="absolute md:relative z-20 h-full shrink-0 flex flex-col overflow-hidden"
              style={{
                borderRight: '1px solid var(--sq-border)',
                background: 'var(--sq-bg)',
              }}
            >
              {/* Search + New */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--sq-text-4)' }} />
                    <Input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="pl-8 h-8 text-[12px]"
                    />
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={createNote}
                        className={buttonVariants({ variant: 'ghost', size: 'icon' }) + ' h-8 w-8 shrink-0'}
                        style={{ color: 'var(--sq-accent)' }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>New note</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Note list */}
              <ScrollArea className="flex-1 px-2 pb-2">
                {filtered.length === 0 && (
                  <p className="text-center text-[11px] py-8" style={{ color: 'var(--sq-text-4)' }}>
                    {search ? 'No matches' : 'No notes yet'}
                  </p>
                )}
                {filtered.map((note) => {
                  const isActive = note.id === activeNoteId;
                  return (
                    <div
                      key={note.id}
                      onClick={() => {
                        setActiveNoteId(note.id);
                        setAiOutput('');
                        if (isMobile()) setShowList(false);
                      }}
                      className="w-full text-left px-3 py-3 rounded-lg mb-1 transition-all duration-100 group cursor-pointer"
                      style={{
                        background: isActive ? 'var(--sq-surface-active)' : 'transparent',
                        color: isActive ? 'var(--sq-text)' : 'var(--sq-text-2)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] truncate" style={{ fontWeight: isActive ? 500 : 400 }}>
                          {displayTitle(note)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          style={{ color: 'var(--sq-danger-text)' }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p
                        className="text-[11px] truncate mt-0.5"
                        style={{ color: 'var(--sq-text-4)' }}
                      >
                        {note.content.replace(/^#+\s*/, '').split('\n')[0]?.slice(0, 60) || 'Empty note'}
                      </p>
                      <span className="text-[10px] mt-1 block" style={{ color: 'var(--sq-text-5)' }}>
                        {formatTime(note.updatedAt)}
                      </span>
                    </div>
                  );
                })}
              </ScrollArea>

              {/* Count */}
              <div className="px-3 py-2.5 text-[11px]" style={{ color: 'var(--sq-text-4)', borderTop: '1px solid var(--sq-border)' }}>
                {notes.length} note{notes.length !== 1 ? 's' : ''}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Editor panel */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Toolbar */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 shrink-0"
          style={{ borderBottom: '1px solid var(--sq-border)' }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowList(!showList)}
                className={buttonVariants({ variant: 'ghost', size: 'icon' }) + ' h-8 w-8'}
              >
                {showList ? <ChevronLeft className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{showList ? 'Hide sidebar' : 'Show sidebar'}</TooltipContent>
          </Tooltip>

          {activeNote && (
            <>
              {/* Write / Preview toggle */}
              <div
                className="flex items-center rounded-lg p-0.5"
                style={{ background: 'var(--sq-surface)' }}
              >
                <button
                  onClick={() => setViewMode('write')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all"
                  style={{
                    fontWeight: viewMode === 'write' ? 500 : 400,
                    color: viewMode === 'write' ? 'var(--sq-text)' : 'var(--sq-text-3)',
                    background: viewMode === 'write' ? 'var(--sq-surface-active)' : 'transparent',
                  }}
                >
                  <Pencil className="w-3 h-3" />
                  Write
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all"
                  style={{
                    fontWeight: viewMode === 'preview' ? 500 : 400,
                    color: viewMode === 'preview' ? 'var(--sq-text)' : 'var(--sq-text-3)',
                    background: viewMode === 'preview' ? 'var(--sq-surface-active)' : 'transparent',
                  }}
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
              </div>

              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 hidden sm:flex">
                {wordCount} words
              </Badge>
              <span className="text-[10px] hidden md:inline" style={{ color: 'var(--sq-text-4)' }}>
                {formatTime(activeNote.updatedAt)}
              </span>

              <div className="flex-1" />

              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating || !activeNote.content.trim()}
                className="gap-1.5 h-8 text-[12px] shrink-0"
                style={{ color: 'var(--sq-accent)' }}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isGenerating ? 'AI...' : LEVEL_LABELS[currentLevel]}</span>
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopy}
                    className={buttonVariants({ variant: 'ghost', size: 'icon' }) + ' h-8 w-8'}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--sq-success-text)' }} /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        {/* Editor / Preview */}
        {activeNote ? (
          <div className="flex-1 flex flex-col min-h-0">
            {aiOutput || isGenerating ? (
              /* AI output shown inline in the same content area */
              <div className="flex-1 flex flex-col min-h-0">
                {/* AI header bar */}
                <div
                  className="flex items-center gap-2 px-3 sm:px-6 py-2 shrink-0"
                  style={{ borderBottom: '1px solid var(--sq-border)', background: 'var(--sq-surface)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--sq-accent)' }} />
                  <Badge variant="secondary" className="text-[10px]">
                    {LEVEL_LABELS[currentLevel]} · {TONE_LABELS[currentTone]}
                  </Badge>
                  {hasApiKey && (
                    <Badge variant="outline" className="text-[9px]" style={{ color: 'var(--sq-success-text)', borderColor: 'var(--sq-success-text)' }}>
                      Live
                    </Badge>
                  )}
                  <div className="flex-1" />
                  {!isGenerating && (
                    <button
                      onClick={() => setAiOutput('')}
                      className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' h-7 text-[11px] gap-1.5'}
                      style={{ color: 'var(--sq-text-3)' }}
                    >
                      <X className="w-3 h-3" />
                      Dismiss
                    </button>
                  )}
                </div>
                {/* AI content */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                  <div className="max-w-2xl">
                    <AnimatedText
                      text={aiOutput}
                      className="text-[13px] whitespace-pre-wrap"
                      style={{
                        color: 'var(--sq-text-2)',
                        lineHeight: '1.7',
                      }}
                    />
                    {isGenerating && (
                      <span
                        className="inline-block w-1.5 h-4 ml-0.5 animate-pulse rounded-sm"
                        style={{ background: 'var(--sq-accent)' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : viewMode === 'write' ? (
              <div ref={editorWrapRef} className="flex-1 flex flex-col min-h-0">
                <Textarea
                  value={activeNote.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="flex-1 w-full border-0 rounded-none p-3 sm:p-6 text-[13px] font-mono focus-visible:ring-0 focus-visible:border-0 overflow-y-auto"
                  style={{
                    color: 'var(--sq-text)',
                    lineHeight: '1.8',
                    caretColor: 'var(--sq-accent)',
                    background: 'transparent',
                    resize: 'none',
                    fieldSizing: 'fixed',
                  }}
                  placeholder="Start writing in Markdown..."
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                <div className="max-w-2xl" style={{ display: 'grid' }}>
                  {/* Layer 1: AnimatedText — always mounted, tracks text for diffs */}
                  <div
                    style={{
                      gridArea: '1/1',
                      opacity: markdownFaded ? 1 : 0,
                      transition: 'opacity 200ms ease',
                      pointerEvents: markdownFaded ? 'auto' : 'none',
                    }}
                  >
                    <AnimatedText
                      text={animTextContent}
                      className="text-[13px] whitespace-pre-wrap"
                      style={{ color: 'var(--sq-text-2)', lineHeight: '1.7' }}
                    />
                  </div>

                  {/* Layer 2: Rendered markdown overlay — opaque bg covers AnimatedText */}
                  {overlayMarkdown && (
                    <div
                      style={{
                        gridArea: '1/1',
                        background: 'var(--sq-bg)',
                        opacity: markdownFaded ? 0 : 1,
                        transition: 'opacity 200ms ease',
                        pointerEvents: markdownFaded ? 'none' : 'auto',
                      }}
                    >
                      {overlayMarkdown}
                    </div>
                  )}

                  {/* Layer 3: Loading spinner — shown during AI precompute */}
                  {currentLevel > 0 && previewSummary.status === 'loading' && (
                    <div
                      style={{ gridArea: '1/1', background: 'var(--sq-bg)' }}
                      className="flex items-center gap-2 py-8 justify-center"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--sq-accent)' }} />
                      <span className="text-[13px]" style={{ color: 'var(--sq-text-3)' }}>
                        Generating {LEVEL_LABELS[currentLevel]}...
                      </span>
                    </div>
                  )}

                  {/* Layer 4: Error state */}
                  {currentLevel > 0 && previewSummary.isError && (
                    <div
                      style={{ gridArea: '1/1', background: 'var(--sq-bg)' }}
                      className="flex items-start gap-2.5 py-4"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--sq-danger-text)' }} />
                      <span className="text-[13px] whitespace-pre-wrap" style={{ color: 'var(--sq-danger-text)', lineHeight: '1.7' }}>
                        {previewSummary.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Toolbar */}
            {viewMode === 'write' && !aiOutput && !isGenerating && (
              <div
                className="shrink-0 flex items-center gap-0.5 px-2 sm:px-3 py-1.5 overflow-x-auto"
                style={{ borderTop: '1px solid var(--sq-border)', background: 'var(--sq-surface)' }}
              >
                {FORMAT_ACTIONS.map((fa, idx) => {
                  const Icon = fa.icon;
                  // Add separators between groups: text styling | headings | lists | code/block | misc
                  const showSep = idx === 3 || idx === 6 || idx === 8 || idx === 11;
                  return (
                    <span key={fa.label} className="flex items-center shrink-0">
                      {showSep && (
                        <Separator orientation="vertical" className="h-4 mx-1" />
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleFormat(fa)}
                            className="p-1.5 rounded-md transition-colors hover:bg-[var(--sq-surface-hover)]"
                            style={{ color: 'var(--sq-text-3)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--sq-text)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--sq-text-3)')}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {fa.label}{fa.shortcut ? ` (${fa.shortcut})` : ''}
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  );
                })}

                <div className="flex-1" />

                <span className="text-[10px] tabular-nums shrink-0 ml-2" style={{ color: 'var(--sq-text-4)' }}>
                  {charCount} chars
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <FileText className="w-10 h-10 mx-auto" style={{ color: 'var(--sq-text-5)' }} />
              <p className="text-[14px]" style={{ color: 'var(--sq-text-3)' }}>
                Create a note to get started
              </p>
              <Button variant="outline" onClick={createNote} className="gap-2">
                <Plus className="w-4 h-4" />
                New Note
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}