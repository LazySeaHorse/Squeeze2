import { useMemo, useState } from 'react';
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageCircle,
  Repeat2,
  Share,
  Bookmark,
  MoreHorizontal,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../stores/appStore';
import {
  SOCIAL_TITLE,
  SOCIAL_POSTS,
  SOCIAL_SUMMARIES,
  SOCIAL_USERS,
} from '../../content';
import type { SocialPost } from '../../content';

// ── Helpers ───────────────────────────────────────────────────────────

function seededNum(seed: number, min: number, max: number) {
  return min + ((seed * 2654435761) >>> 0) % (max - min + 1);
}

// ── List animation variants ───────────────────────────────────────────

const listItemVariants: any = {
  initial: { opacity: 0, y: 14, scale: 0.97 },
  animate: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      opacity: { duration: 0.4, delay },
      y: { type: 'spring', stiffness: 220, damping: 18, delay },
      scale: { type: 'spring', stiffness: 220, damping: 18, delay },
    },
  }),
  exit: (delay: number) => ({
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: {
      duration: 0.3,
      delay: delay * 0.5,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
};

/** Stagger delay: linear ramp capped at 0.3s */
function listStagger(index: number, total: number): number {
  if (total <= 1) return 0;
  return Math.min(index * (0.3 / Math.max(total - 1, 1)), 0.3);
}

// ── Sub-components ────────────────────────────────────────────────────

function PostAvatar({ handle }: { handle: string }) {
  const user = SOCIAL_USERS[handle];
  const color = user?.color ?? '#6b7280';
  return (
    <div
      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 flex items-center justify-center"
      style={{ background: color }}
    >
      <span className="text-[10px] sm:text-[11px] text-white" style={{ fontWeight: 700 }}>
        {handle.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  count,
  activeColor,
  onClick,
  active,
}: {
  icon: React.ElementType;
  count?: number;
  activeColor?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="flex items-center gap-1 sm:gap-1.5 h-7 px-1.5 sm:px-2 rounded-md transition-colors duration-150"
      style={{
        color: active ? activeColor : 'var(--sq-text-4)',
        background: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--sq-surface-hover)';
        if (activeColor) e.currentTarget.style.color = activeColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        if (!active) e.currentTarget.style.color = 'var(--sq-text-4)';
      }}
    >
      <Icon className="w-3.5 h-3.5" />
      {count !== undefined && (
        <span className="text-[11px]" style={{ fontWeight: 500 }}>{count}</span>
      )}
    </button>
  );
}

function VoteButtons({ index }: { index: number }) {
  const baseScore = seededNum(index + 42, 5, 320);
  const [offset, setOffset] = useState(0);
  const vote = offset;

  return (
    <div className="flex items-center gap-0.5 rounded-full px-0.5" style={{ background: 'var(--sq-surface)' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOffset(vote === 1 ? 0 : 1); }}
        className="p-0.5 rounded transition-colors duration-150"
        style={{ color: vote === 1 ? '#FF6D00' : 'var(--sq-text-4)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#FF6D00'; }}
        onMouseLeave={(e) => { if (vote !== 1) e.currentTarget.style.color = 'var(--sq-text-4)'; }}
      >
        <ArrowBigUp className="w-4 h-4" fill={vote === 1 ? 'currentColor' : 'none'} />
      </button>
      <span
        className="text-[11px] min-w-[1.5rem] text-center"
        style={{ fontWeight: 600, color: vote === 1 ? '#FF6D00' : vote === -1 ? '#9D4EDD' : 'var(--sq-text-3)' }}
      >
        {baseScore + offset}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); setOffset(vote === -1 ? 0 : -1); }}
        className="p-0.5 rounded transition-colors duration-150"
        style={{ color: vote === -1 ? '#9D4EDD' : 'var(--sq-text-4)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#9D4EDD'; }}
        onMouseLeave={(e) => { if (vote !== -1) e.currentTarget.style.color = 'var(--sq-text-4)'; }}
      >
        <ArrowBigDown className="w-4 h-4" fill={vote === -1 ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

function PostCard({
  post,
  index,
  isLast,
  isSummary,
}: {
  post: SocialPost;
  index: number;
  isLast: boolean;
  isSummary: boolean;
}) {
  const user = SOCIAL_USERS[post.handle];
  const commentCount = seededNum(index + 7, 1, 24);
  const repostCount = seededNum(index + 13, 0, 48);
  const [saved, setSaved] = useState(false);
  const color = user?.color ?? '#6b7280';

  // Highlight @mentions in text
  const renderText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} style={{ color: 'var(--sq-accent)' }}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="relative">
      {/* Thread line */}
      {post.isReply && !isSummary && (
        <div
          className="absolute left-4 sm:left-[18px] top-0 w-[2px] h-3"
          style={{ background: 'var(--sq-border-2)' }}
        />
      )}
      {!isLast && !isSummary && (
        <div
          className="absolute left-4 sm:left-[18px] bottom-0 w-[2px]"
          style={{
            background: 'var(--sq-border)',
            top: post.isReply ? '3rem' : '2.75rem',
          }}
        />
      )}

      <div
        className="flex gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 transition-colors duration-100 rounded-lg"
        style={{ cursor: 'default' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sq-surface)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <PostAvatar handle={post.handle} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[13px] truncate" style={{ fontWeight: 600, color: 'var(--sq-text)' }}>
              {user?.display ?? post.handle}
            </span>
            <span className="text-[12px]" style={{ color: 'var(--sq-text-4)' }}>
              @{post.handle}
            </span>
            <span className="text-[12px]" style={{ color: 'var(--sq-text-4)' }}>·</span>
            <span className="text-[12px]" style={{ color: 'var(--sq-text-4)' }}>
              {post.time}
            </span>
            {isSummary && (
              <span
                className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  background: 'var(--sq-accent-dim)',
                  color: 'var(--sq-accent)',
                  fontWeight: 700,
                }}
              >
                Summary
              </span>
            )}
            <div className="ml-auto">
              <button
                className="p-1 rounded transition-colors duration-150"
                style={{ color: 'var(--sq-text-4)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sq-surface-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Reply indicator — only for non-summary posts */}
          {post.replyTo && !isSummary && (
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--sq-text-4)' }}>
              Replying to{' '}
              <span style={{ color: 'var(--sq-accent)' }}>@{post.replyTo}</span>
            </div>
          )}

          {/* Body */}
          <p
            className="text-[13px] mt-1.5 sm:mt-2 break-words"
            style={{
              lineHeight: '1.65',
              color: 'var(--sq-text-2)',
              borderLeft: isSummary ? `2px solid ${color}` : undefined,
              paddingLeft: isSummary ? '10px' : undefined,
            }}
          >
            {renderText(post.text)}
          </p>

          {/* Action bar */}
          <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-2.5 -ml-1.5">
            <VoteButtons index={index} />
            <ActionButton
              icon={MessageCircle}
              count={commentCount}
              activeColor="#9D4EDD"
            />
            <ActionButton
              icon={Repeat2}
              count={repostCount}
              activeColor="#FF9E00"
            />
            <ActionButton
              icon={Share}
              activeColor="var(--sq-accent)"
            />
            <ActionButton
              icon={Bookmark}
              active={saved}
              activeColor="#FF6D00"
              onClick={() => setSaved(!saved)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1 px-3 sm:px-4">
      <div className="flex-1 h-px" style={{ background: 'var(--sq-border)' }} />
      <span
        className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
        style={{ color: 'var(--sq-text-4)', background: 'var(--sq-surface)' }}
      >
        <Layers className="w-3 h-3" />
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--sq-border)' }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export function SocialTab() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setCurrentLevel = useAppStore((s) => s.setCurrentLevel);

  const isSummarized = currentLevel > 0;
  const summaryLabel = currentLevel === 1 ? 'Condensed' : currentLevel === 2 ? 'Brief' : 'Minimal';

  const displayGroups = useMemo(() => {
    if (currentLevel === 0) {
      return [SOCIAL_POSTS];
    }
    const summaryLevel = currentLevel as 1 | 2 | 3;
    return SOCIAL_SUMMARIES[summaryLevel];
  }, [currentLevel]);

  const totalSummaries = displayGroups.reduce((a, g) => a + g.length, 0);

  // Flatten for stagger counting
  const flatItems = useMemo(() => {
    const items: { gi: number; i: number; post: SocialPost; globalIndex: number }[] = [];
    let idx = 0;
    displayGroups.forEach((group, gi) => {
      group.forEach((post, i) => {
        items.push({ gi, i, post, globalIndex: idx++ });
      });
    });
    return items;
  }, [displayGroups]);

  const totalItems = flatItems.length;

  return (
    <div className="space-y-3">
      {/* Thread header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[15px]" style={{ fontWeight: 500, color: 'var(--sq-text)' }}>
          {SOCIAL_TITLE}
        </h2>
        <div className="flex items-center gap-2">
          {isSummarized && (
            <button
              onClick={() => setCurrentLevel(0)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors duration-100"
              style={{
                background: 'var(--sq-accent-dim)',
                color: 'var(--sq-accent)',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <RotateCcw className="w-3 h-3" />
              {summaryLabel} · Reset
            </button>
          )}
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: 'var(--sq-surface)', color: 'var(--sq-text-3)' }}
          >
            {isSummarized
              ? `${SOCIAL_POSTS.length} → ${totalSummaries} summaries`
              : `${SOCIAL_POSTS.length} posts`
            }
          </span>
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: 'var(--sq-border)', background: 'var(--sq-bg)' }}
      >
        {/* Thread banner */}
        <div
          className="px-3 sm:px-4 py-2.5 flex items-center gap-2 border-b"
          style={{ borderColor: 'var(--sq-border)', background: 'var(--sq-surface)' }}
        >
          <div
            className="w-1 h-4 rounded-full"
            style={{ background: 'var(--sq-accent)' }}
          />
          <span className="text-[12px]" style={{ fontWeight: 500, color: 'var(--sq-text-3)' }}>
            Trending in Tech
          </span>
          <span className="text-[11px] ml-auto" style={{ color: 'var(--sq-text-4)' }}>
            r/remotework
          </span>
        </div>

        {/* Posts */}
        <div
          className="divide-y"
          style={{ borderColor: 'var(--sq-border)' }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {flatItems.map(({ gi, i, post, globalIndex }) => {
              const delay = listStagger(globalIndex, totalItems);
              const showGroupSep = gi > 0 && i === 0 && isSummarized;
              const isLast = globalIndex === totalItems - 1;

              return (
                <motion.div
                  key={`${currentLevel}-${gi}-${i}`}
                  custom={delay}
                  variants={listItemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {showGroupSep && (
                    <GroupSeparator label={`Section ${gi + 1}`} />
                  )}
                  <PostCard
                    post={post}
                    index={gi * 100 + i}
                    isLast={isLast}
                    isSummary={isSummarized}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Thread footer */}
        <div
          className="px-3 sm:px-4 py-2.5 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--sq-border)', background: 'var(--sq-surface)' }}
        >
          <span className="text-[11px]" style={{ color: 'var(--sq-text-4)' }}>
            {isSummarized ? 'Showing summarized thread' : 'Show more replies'}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--sq-text-4)' }}>
            Sorted by Best
          </span>
        </div>
      </div>
    </div>
  );
}