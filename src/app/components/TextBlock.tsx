interface TextBlockProps {
  text: string;
  isCode?: boolean;
  onClick?: () => void;
}

// ── Static inline renderer ────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(
        <span key={key++} style={{ fontWeight: 600 }}>
          {match[2]}
        </span>,
      );
    } else if (match[3]) {
      parts.push(
        <code
          key={key++}
          className="text-[11.5px] px-1 py-0.5 rounded"
          style={{ background: 'var(--sq-surface-hover)', fontFamily: 'monospace' }}
        >
          {match[3]}
        </code>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length === 1 ? parts[0] : parts;
}

// ── Static markdown renderer ──────────────────────────────────────────
function renderMarkdown(raw: string, isCode?: boolean): React.ReactNode {
  if (isCode) {
    return (
      <pre
        className="font-mono text-[12px] whitespace-pre overflow-x-auto"
        style={{ lineHeight: '1.7', tabSize: 2 }}
      >
        {raw}
      </pre>
    );
  }

  return raw.split('\n\n').map((block, bi) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (/^[•\-\*]\s/.test(trimmed)) {
      const items = trimmed.split('\n').filter((l) => l.trim());
      return (
        <ul key={bi} className="space-y-1 my-2 pl-1">
          {items.map((item, ii) => (
            <li key={ii} className="flex gap-2 text-[13px]" style={{ lineHeight: '1.7' }}>
              <span className="shrink-0 opacity-40">•</span>
              <span>{renderInline(item.replace(/^[•\-\*]\s*/, ''))}</span>
            </li>
          ))}
        </ul>
      );
    }

    const headingMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch) {
      return (
        <p key={bi} className="text-[13px] mt-3 mb-1" style={{ fontWeight: 600, lineHeight: '1.5' }}>
          {headingMatch[1]}
        </p>
      );
    }

    return (
      <p key={bi} className="text-[13px] my-1.5" style={{ lineHeight: '1.7' }}>
        {renderInline(trimmed)}
      </p>
    );
  });
}

// ── Main component ────────────────────────────────────────────────────
export function TextBlock({ text, isCode, onClick }: TextBlockProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-default"
      style={{
        color: 'var(--sq-text-2)',
        borderRadius: '8px',
      }}
    >
      {renderMarkdown(text, isCode)}
    </div>
  );
}
