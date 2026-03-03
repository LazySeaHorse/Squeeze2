import { motion, AnimatePresence } from 'motion/react';
import { useTextDiff } from '../hooks/useTextDiff';

/*
 * ── Stagger ──────────────────────────────────────────────────────────
 *
 * Short texts (≤ 200 tokens): sine-wave stagger radiating from ~4
 * natural hotspots.
 *
 * Long texts (> 200 tokens): simple sequential stagger from the
 * beginning of the text.  This avoids simultaneous animation
 * clusters that tank GPU performance on large articles.
 *
 * Max spread is 0.3 s in both cases.
 */
const LONG_TEXT_THRESHOLD = 200;

function staggerDelay(index: number, total: number): number {
  if (total <= 1) return 0;
  if (total > LONG_TEXT_THRESHOLD) {
    // Sequential: linear ramp from 0 → 0.3 s
    return (index / (total - 1)) * 0.3;
  }
  // Short text: sine-wave hotspots
  const t = (index / Math.max(total - 1, 1)) * Math.PI * 3;
  return Math.abs(Math.sin(t)) * 0.3;
}

/*
 * ── Word variants ────────────────────────────────────────────────────
 *
 * Enter  – fade + scale-up + rise, with a soft spring that
 *          overshoots slightly (damping 18 → ζ ≈ 0.60, visible overshoot).
 *
 * Exit   – fade + scale-down + drift-up, using a custom
 *          cubic ease that decelerates naturally.
 *
 * Three animated properties (opacity, scale, y) keep the transition
 * lightweight — blur was removed for GPU performance.
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

/*
 * ── Space variants ───────────────────────────────────────────────────
 *
 * Whitespace tokens just fade; no transform, no blur.
 * Shorter duration so they don't linger after their adjacent words
 * have already animated.
 */
const spaceVariants: any = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

/*
 * ── Persisted-word variants ──────────────────────────────────────────
 *
 * Tokens that survived a diff pass (isNew = false).  No enter
 * animation — they're already on screen.  But they still need exit
 * variants so AnimatePresence can animate them out on future diffs.
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

// ─────────────────────────────────────────────────────────────────────

interface AnimatedTextProps {
  /** Current text to render.  Word-level diffs run when this changes. */
  text: string;
  /** Extra classes on the wrapper div. */
  className?: string;
  /** Inline styles on the wrapper div. */
  style?: React.CSSProperties;
}

/**
 * Renders `text` with per-word enter / exit animations.
 *
 * Design constraints applied:
 *  • NO `layout` / `layout="position"` — avoids the inline-block
 *    floating bug where words drift between lines during reflow.
 *  • `mode="popLayout"` — exiting words are popped to absolute so
 *    remaining text reflows immediately (no two-phase stutter).
 *  • `initial={false}` — first paint is instant (no entrance storm).
 *
 * To skip the diff animation entirely (e.g. switching article), set a
 * different React `key` on <AnimatedText> so it remounts fresh.
 */
export function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const tokens = useTextDiff(text);
  const total = tokens.length;

  return (
    <motion.div className={className} style={style}>
      <AnimatePresence mode="popLayout" initial={false}>
        {tokens.map((token, index) => {
          const isSpace = /^\s+$/.test(token.text);
          const delay = staggerDelay(index, total);

          /*
           * Persisted tokens use lightweight motion.span variants
           * with instant enter (no spring work) but proper exit
           * animations so AnimatePresence can animate them out later.
           */
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