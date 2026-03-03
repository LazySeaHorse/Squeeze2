import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTextDiff, type Token } from '../hooks/useTextDiff';

/*
 * ── Stagger ──────────────────────────────────────────────────────────
 * Short texts (≤ 200 tokens): sine-wave stagger from ~4 hotspots.
 * Long texts (> 200 tokens): sequential from the beginning.
 */
const LONG_TEXT_THRESHOLD = 200;

function staggerDelay(index: number, total: number): number {
  if (total <= 1) return 0;
  if (total > LONG_TEXT_THRESHOLD) {
    return (index / (total - 1)) * 0.3;
  }
  const t = (index / Math.max(total - 1, 1)) * Math.PI * 3;
  return Math.abs(Math.sin(t)) * 0.3;
}

/*
 * ── Word variants ────────────────────────────────────────────────────
 * Same spring physics as AnimatedText: opacity, scale, y.
 * Blur removed for GPU performance.
 */
const wordVariants: any = {
  initial: {
    opacity: 0,
    scale: 0.82,
    y: 6,
  },
  animate: (delay: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.5, delay },
      scale: { type: 'spring', stiffness: 220, damping: 18, delay },
      y: { type: 'spring', stiffness: 220, damping: 18, delay },
    },
  }),
  exit: (delay: number) => ({
    opacity: 0,
    scale: 0.86,
    y: -5,
    transition: {
      duration: 0.5,
      delay: delay * 0.4,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
};

const spaceVariants: any = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

/*
 * ── Persisted variants ───────────────────────────────────────────────
 * Instant enter (no spring work), but proper exit for future diffs.
 */
const persistedWordVariants: any = {
  initial: { opacity: 1, scale: 1, y: 0 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0 } },
  exit: (delay: number) => ({
    opacity: 0,
    scale: 0.86,
    y: -5,
    transition: {
      duration: 0.5,
      delay: delay * 0.4,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
};

const persistedSpaceVariants: any = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

// ── Syntax token colors ──────────────────────────────────────────────

const C_COMMENT = 'rgb(52, 211, 153)';   // emerald-400
const C_KEYWORD = 'rgb(167, 139, 250)';  // violet-400
const C_TYPE    = 'rgb(45, 212, 191)';   // teal-400
const C_STRING  = 'rgb(252, 211, 77)';   // amber-300
const C_NUMBER  = 'rgb(251, 146, 60)';   // orange-400
const C_JSX     = 'rgb(248, 113, 113)';  // red-400
const C_FN      = 'rgb(56, 189, 248)';   // sky-400

const KEYWORDS = new Set([
  'import', 'from', 'export', 'function', 'const', 'let', 'var',
  'return', 'if', 'else', 'type', 'interface', 'new', 'typeof',
  'extends', 'implements', 'class', 'this', 'void', 'null',
  'undefined', 'true', 'false', 'default', 'async', 'await',
  'try', 'catch', 'throw',
]);

const TYPES = new Set([
  'React', 'Todo', 'Todo[]', 'TodoStats', 'FilterMode',
  'TodoItemProps', 'HTMLElement', 'KeyboardEvent',
  'string', 'number', 'boolean', 'React.KeyboardEvent',
]);

/**
 * Compute per-token syntax colors from the full token list.
 * Tracks line-comment (`//`) and block-comment (`/* ... *​/`) state
 * across the sequential token stream.
 */
function computeTokenColors(tokens: Token[]): Map<string, string | undefined> {
  const colors = new Map<string, string | undefined>();
  let inLineComment = false;
  let inBlockComment = false;

  for (const token of tokens) {
    const t = token.text;
    const isSpace = /^\s+$/.test(t);

    if (isSpace) {
      colors.set(token.id, undefined);
      // Newline ends line comments
      if (t.includes('\n')) {
        inLineComment = false;
      }
      continue;
    }

    // Inside comment context
    if (inLineComment) {
      colors.set(token.id, C_COMMENT);
      continue;
    }

    if (inBlockComment) {
      colors.set(token.id, C_COMMENT);
      if (t.includes('*/')) {
        inBlockComment = false;
      }
      continue;
    }

    // Detect comment starts
    if (t.startsWith('//')) {
      inLineComment = true;
      colors.set(token.id, C_COMMENT);
      continue;
    }

    if (t.startsWith('/*') || t.startsWith('/**')) {
      inBlockComment = true;
      colors.set(token.id, C_COMMENT);
      if (t.includes('*/') && !t.startsWith('/**')) {
        inBlockComment = false;
      }
      continue;
    }

    // Block comment continuation marker
    if (t === '*' || t === '*/') {
      // stray * at the start of a doc line (shouldn't happen if block is tracked)
      colors.set(token.id, undefined);
      continue;
    }

    // Keywords
    if (KEYWORDS.has(t)) {
      colors.set(token.id, C_KEYWORD);
      continue;
    }

    // Types (exact match or with brackets)
    if (TYPES.has(t) || TYPES.has(t.replace(/[<>\[\]().,;:{}|&?!]/g, ''))) {
      colors.set(token.id, C_TYPE);
      continue;
    }

    // Strings
    if (/^['"`]/.test(t)) {
      colors.set(token.id, C_STRING);
      continue;
    }

    // Numbers
    if (/^\d/.test(t)) {
      colors.set(token.id, C_NUMBER);
      continue;
    }

    // JSX-like tags
    if (/^<\/?[a-zA-Z]/.test(t)) {
      colors.set(token.id, C_JSX);
      continue;
    }

    // Pseudocode keywords (uppercase words from level 2/3)
    if (/^(IF|THEN|ELSE|APPEND|CLEAR|MAP|FILTER|KEEP|CALL|FLIP|EACH|RENDER|REMOVE)$/.test(t)) {
      colors.set(token.id, C_KEYWORD);
      continue;
    }

    // Arrow / special tokens
    if (t === '=>' || t === '→' || t === '≠') {
      colors.set(token.id, C_KEYWORD);
      continue;
    }

    // Default
    colors.set(token.id, undefined);
  }

  return colors;
}

// ─────────────────────────────────────────────────────────────────────

interface AnimatedCodeProps {
  /** Current code text to render. Word-level diffs run when this changes. */
  text: string;
  /** Extra classes on the wrapper div. */
  className?: string;
  /** Inline styles on the wrapper div. */
  style?: React.CSSProperties;
}

/**
 * Renders `text` as syntax-highlighted code with per-word diff animation.
 *
 * Combines:
 * - `useTextDiff` for stable-keyed word tokens
 * - Per-token syntax coloring (comments, keywords, types, strings, etc.)
 * - AnimatePresence with popLayout for smooth enter/exit
 *
 * Same constraints as AnimatedText:
 * - No `layout` or `layout="position"` props
 * - `mode="popLayout"` + `initial={false}`
 */
export function AnimatedCode({ text, className, style }: AnimatedCodeProps) {
  const tokens = useTextDiff(text);
  const total = tokens.length;

  const colorMap = useMemo(() => computeTokenColors(tokens), [tokens]);

  return (
    <motion.div className={className} style={style}>
      <AnimatePresence mode="popLayout" initial={false}>
        {tokens.map((token, index) => {
          const isSpace = /^\s+$/.test(token.text);
          const delay = staggerDelay(index, total);
          const color = colorMap.get(token.id);

          /* Persisted tokens: instant enter, proper exit */
          if (!token.isNew) {
            if (isSpace) {
              return (
                <motion.span
                  key={token.id}
                  className="inline whitespace-pre"
                  variants={persistedSpaceVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {token.text}
                </motion.span>
              );
            }
            return (
              <motion.span
                key={token.id}
                className="inline-block"
                style={color ? { color } : undefined}
                custom={delay}
                variants={persistedWordVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {token.text}
              </motion.span>
            );
          }

          if (isSpace) {
            return (
              <motion.span
                key={token.id}
                className="inline whitespace-pre"
                variants={spaceVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {token.text}
              </motion.span>
            );
          }

          return (
            <motion.span
              key={token.id}
              className="inline-block"
              style={color ? { color } : undefined}
              custom={delay}
              variants={wordVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {token.text}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}