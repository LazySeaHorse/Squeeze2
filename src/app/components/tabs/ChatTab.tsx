import { useMemo, useRef, useEffect, useState } from 'react';
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Users,
  ImageIcon,
  Smile,
  Paperclip,
  CheckCheck,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../stores/appStore';
import { CHAT_TITLE, CHAT_MESSAGES, CHAT_SUMMARIES } from '../../content';
import type { ChatMsg } from '../../content';

// ── Types ─────────────────────────────────────────────────────────────

interface DisplayMessage extends ChatMsg {
  time: string;
  isSummary: boolean;
}

// ── User data ─────────────────────────────────────────────────────────

const USERS: Record<string, { color: string; status: 'online' | 'away' | 'offline' }> = {
  Alex:   { color: '#9D4EDD', status: 'online' },
  Maya:   { color: '#FF6D00', status: 'online' },
  Sam:    { color: '#FF9E00', status: 'online' },
  Jordan: { color: '#240046', status: 'away' },
};

const STATUS_COLORS = {
  online: '#FF9E00',
  away: '#FF6D00',
  offline: 'var(--sq-text-4)',
};

// ── Mock sidebar chats ────────────────────────────────────────────────

interface SidebarChat {
  id: string;
  name: string;
  isGroup: boolean;
  members?: string[];
  lastMessage: string;
  lastSender: string;
  time: string;
  unread: number;
  avatar: { letter: string; color: string };
}

const SIDEBAR_CHATS: SidebarChat[] = [
  {
    id: 'birthday',
    name: "Maya's Birthday Dinner",
    isGroup: true,
    members: ['Alex', 'Maya', 'Sam', 'Jordan'],
    lastMessage: "I love you all so much",
    lastSender: 'Maya',
    time: '2:45 PM',
    unread: 0,
    avatar: { letter: '🎂', color: '#FF6D00' },
  },
  {
    id: 'work',
    name: 'Design Team',
    isGroup: true,
    members: ['Alex', 'Priya', 'Derek', 'Nina'],
    lastMessage: 'The mockups look great, shipping Monday',
    lastSender: 'Priya',
    time: '1:12 PM',
    unread: 3,
    avatar: { letter: 'D', color: '#240046' },
  },
  {
    id: 'sam-dm',
    name: 'Sam',
    isGroup: false,
    lastMessage: 'Did you try that new ramen place?',
    lastSender: 'Sam',
    time: '11:30 AM',
    unread: 1,
    avatar: { letter: 'S', color: '#FF9E00' },
  },
  {
    id: 'jordan-dm',
    name: 'Jordan',
    isGroup: false,
    lastMessage: 'Can you review my PR when you get a chance?',
    lastSender: 'Jordan',
    time: 'Yesterday',
    unread: 0,
    avatar: { letter: 'J', color: '#9D4EDD' },
  },
  {
    id: 'running',
    name: 'Running Club',
    isGroup: true,
    members: ['Alex', 'Maya', 'Derek'],
    lastMessage: '5K Saturday morning?',
    lastSender: 'Derek',
    time: 'Yesterday',
    unread: 0,
    avatar: { letter: '🏃', color: '#FF6D00' },
  },
  {
    id: 'mom',
    name: 'Mom',
    isGroup: false,
    lastMessage: 'Call me when you get a chance sweetie',
    lastSender: 'Mom',
    time: 'Monday',
    unread: 0,
    avatar: { letter: 'M', color: '#9D4EDD' },
  },
];

// ── Time generator ────────────────────────────────────────────────────

function generateTime(index: number): string {
  const baseMinute = 602 + index * 3; // 10:02 AM + stagger
  const hours = Math.floor(baseMinute / 60);
  const mins = baseMinute % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`;
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

function ChatAvatar({
  letter,
  color,
  size = 'md',
  status,
}: {
  letter: string;
  color: string;
  size?: 'sm' | 'md';
  status?: 'online' | 'away' | 'offline';
}) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-[13px]';
  const isEmoji = /\p{Emoji}/u.test(letter) && letter.length > 1;

  return (
    <div className="relative shrink-0">
      <div
        className={`${dim} rounded-full flex items-center justify-center`}
        style={{ background: color }}
      >
        <span className={`${isEmoji ? 'text-[16px]' : textSize} text-white`} style={{ fontWeight: 700 }}>
          {isEmoji ? letter : letter[0]?.toUpperCase()}
        </span>
      </div>
      {status && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
          style={{
            background: STATUS_COLORS[status],
            borderColor: 'var(--sq-bg)',
          }}
        />
      )}
    </div>
  );
}

function SidebarItem({
  chat,
  active,
  onClick,
}: {
  chat: SidebarChat;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-100"
      style={{
        background: active ? 'var(--sq-surface-active)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'var(--sq-surface)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <ChatAvatar letter={chat.avatar.letter} color={chat.avatar.color} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[13px] truncate"
            style={{ fontWeight: chat.unread > 0 ? 600 : 400, color: 'var(--sq-text)' }}
          >
            {chat.name}
          </span>
          <span
            className="text-[10px] shrink-0"
            style={{ color: chat.unread > 0 ? 'var(--sq-accent)' : 'var(--sq-text-4)' }}
          >
            {chat.time}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-[11px] truncate flex-1"
            style={{ color: chat.unread > 0 ? 'var(--sq-text-2)' : 'var(--sq-text-4)' }}
          >
            {chat.isGroup && chat.lastSender !== 'You' ? `${chat.lastSender}: ` : ''}
            {chat.lastMessage}
          </span>
          {chat.unread > 0 && (
            <span
              className="text-[9px] w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--sq-accent)', color: 'white', fontWeight: 700 }}
            >
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({
  message,
  isMe,
  showSender,
  isConsecutive,
  isSummary,
}: {
  message: DisplayMessage;
  isMe: boolean;
  showSender: boolean;
  isConsecutive: boolean;
  isSummary: boolean;
}) {
  const user = USERS[message.sender];
  const color = user?.color ?? '#6b7280';

  return (
    <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''} ${isConsecutive ? 'mt-0.5' : 'mt-3'}`}>
      {/* Avatar column */}
      <div className="w-7 shrink-0">
        {!isConsecutive && !isMe && (
          <ChatAvatar letter={message.sender} color={color} size="sm" />
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-[65%]`}>
        {showSender && !isMe && !isConsecutive && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span
              className="text-[10px]"
              style={{ color, fontWeight: 600 }}
            >
              {message.sender}
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
          </div>
        )}
        <div className="flex items-end gap-1.5">
          {isMe && (
            <span className="text-[9px] shrink-0 mb-1" style={{ color: 'var(--sq-text-4)' }}>
              {message.time}
            </span>
          )}
          <div
            className="px-3 py-2 text-[13px]"
            style={{
              lineHeight: '1.55',
              background: isSummary
                ? 'var(--sq-surface-hover)'
                : isMe ? 'var(--sq-accent-dim)' : 'var(--sq-surface)',
              color: 'var(--sq-text)',
              borderRadius: isMe
                ? isConsecutive ? '14px 4px 4px 14px' : '14px 14px 4px 14px'
                : isConsecutive ? '4px 14px 14px 4px' : '14px 14px 14px 4px',
              borderLeft: isSummary && !isMe ? `2px solid ${color}` : undefined,
              borderRight: isSummary && isMe ? '2px solid var(--sq-accent)' : undefined,
            }}
          >
            {message.text}
          </div>
          {!isMe && (
            <span className="text-[9px] shrink-0 mb-1" style={{ color: 'var(--sq-text-4)' }}>
              {message.time}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function GroupSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
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

function ComposeBar() {
  const [value, setValue] = useState('');

  return (
    <div
      className="px-3 sm:px-4 py-2.5 border-t flex items-end gap-2 shrink-0"
      style={{ borderColor: 'var(--sq-border)', background: 'var(--sq-bg)' }}
    >
      <button
        className="p-2 rounded-lg shrink-0 hidden sm:flex"
        style={{ color: 'var(--sq-text-4)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sq-surface)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <Paperclip className="w-4 h-4" />
      </button>
      <button
        className="p-2 rounded-lg shrink-0 hidden sm:flex"
        style={{ color: 'var(--sq-text-4)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sq-surface)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <div
        className="flex-1 flex items-end rounded-xl px-3 py-2 min-h-[40px]"
        style={{ background: 'var(--sq-surface)', border: '1px solid var(--sq-border)' }}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none text-[13px]"
          style={{
            color: 'var(--sq-text)',
            lineHeight: '1.5',
            maxHeight: '100px',
          }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 100) + 'px';
          }}
        />
      </div>
      <button
        className="p-2 rounded-lg shrink-0"
        style={{ color: 'var(--sq-text-4)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sq-surface)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <Smile className="w-4 h-4" />
      </button>
      <button
        className="p-2 rounded-lg shrink-0"
        style={{
          background: value.trim() ? 'var(--sq-accent)' : 'var(--sq-surface)',
          color: value.trim() ? 'white' : 'var(--sq-text-4)',
        }}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export function ChatTab() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const setCurrentLevel = useAppStore((s) => s.setCurrentLevel);

  // Build display messages
  const displayGroups = useMemo(() => {
    if (currentLevel === 0) {
      // Full conversation — single group
      const msgs: DisplayMessage[] = CHAT_MESSAGES.map((m, i) => ({
        ...m,
        time: generateTime(i),
        isSummary: false,
      }));
      return [msgs];
    }

    // Summarized — multiple groups
    const summaryLevel = currentLevel as 1 | 2 | 3;
    const groups = CHAT_SUMMARIES[summaryLevel];
    return groups.map((group, gi) =>
      group.map((m, mi) => ({
        ...m,
        time: generateTime(gi * 10 + mi),
        isSummary: true,
      }))
    );
  }, [currentLevel]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayGroups]);

  const activeChat = SIDEBAR_CHATS[0];
  const onlineCount = activeChat.members
    ? activeChat.members.filter((m) => USERS[m]?.status === 'online').length
    : 0;

  const isSummarized = currentLevel > 0;
  const summaryLabel = currentLevel === 1 ? 'Condensed' : currentLevel === 2 ? 'Brief' : 'Minimal';

  // Flatten for stagger counting
  const flatItems = useMemo(() => {
    const items: { gi: number; i: number; msg: DisplayMessage; globalIndex: number }[] = [];
    let idx = 0;
    displayGroups.forEach((group, gi) => {
      group.forEach((msg, i) => {
        items.push({ gi, i, msg, globalIndex: idx++ });
      });
    });
    return items;
  }, [displayGroups]);

  const totalItems = flatItems.length;

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <div
        className="hidden md:flex flex-col w-[280px] lg:w-[300px] shrink-0 border-r"
        style={{ borderColor: 'var(--sq-border)', background: 'var(--sq-bg)' }}
      >
        {/* Sidebar header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--sq-border)' }}
        >
          <span className="text-[15px]" style={{ fontWeight: 600, color: 'var(--sq-text)' }}>
            Messages
          </span>
          <button
            className="p-1.5 rounded-md"
            style={{ color: 'var(--sq-text-3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sq-surface)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {SIDEBAR_CHATS.map((chat) => (
            <SidebarItem
              key={chat.id}
              chat={chat}
              active={chat.id === 'birthday'}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>

      {/* ── Chat area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Chat header */}
        <div
          className="px-3 sm:px-5 py-2.5 border-b flex items-center gap-3 shrink-0"
          style={{ borderColor: 'var(--sq-border)', background: 'var(--sq-bg)' }}
        >
          <ChatAvatar letter={activeChat.avatar.letter} color={activeChat.avatar.color} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] truncate" style={{ fontWeight: 600, color: 'var(--sq-text)' }}>
                {activeChat.name}
              </span>
              {activeChat.isGroup && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--sq-surface)', color: 'var(--sq-text-4)' }}
                >
                  <Users className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                  {activeChat.members?.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {activeChat.members ? (
                <span className="text-[11px]" style={{ color: 'var(--sq-text-4)' }}>
                  {onlineCount} online · {activeChat.members.join(', ')}
                </span>
              ) : (
                <span className="text-[11px]" style={{ color: 'var(--sq-text-4)' }}>
                  Active now
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {/* Summary reset button */}
            {isSummarized && (
              <button
                onClick={() => setCurrentLevel(0)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mr-1 text-[11px] transition-colors duration-100"
                style={{
                  background: 'var(--sq-accent-dim)',
                  color: 'var(--sq-accent)',
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">{summaryLabel}</span>
                <span className="hidden sm:inline">·</span>
                Reset
              </button>
            )}
            <button
              className="p-2 rounded-lg hidden sm:flex"
              style={{ color: 'var(--sq-text-3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sq-surface)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-lg hidden sm:flex"
              style={{ color: 'var(--sq-text-3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sq-surface)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-lg"
              style={{ color: 'var(--sq-text-3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sq-surface)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-5 py-4"
        >
          {/* Date separator */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-px" style={{ background: 'var(--sq-border)' }} />
            <span className="text-[10px] shrink-0 px-2" style={{ color: 'var(--sq-text-4)' }}>
              Today
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--sq-border)' }} />
          </div>

          <AnimatePresence mode="popLayout" initial={false}>
            {flatItems.map(({ gi, i, msg, globalIndex }) => {
              const isMe = msg.sender === 'Alex';
              const prevInGroup = i > 0 ? displayGroups[gi][i - 1] : null;
              const isConsecutive = prevInGroup?.sender === msg.sender;
              const delay = listStagger(globalIndex, totalItems);
              const showGroupSep = gi > 0 && i === 0 && isSummarized;

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
                  <MessageBubble
                    message={msg}
                    isMe={isMe}
                    showSender={true}
                    isConsecutive={isConsecutive && !showGroupSep}
                    isSummary={msg.isSummary}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Read receipt */}
          <AnimatePresence mode="popLayout">
            {!isSummarized && (
              <motion.div
                key="read-receipt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.3 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex justify-end mt-1 mr-9"
              >
                <div className="flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" style={{ color: 'var(--sq-accent)' }} />
                  <span className="text-[9px]" style={{ color: 'var(--sq-text-4)' }}>
                    Read by everyone
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary count indicator */}
          <AnimatePresence mode="popLayout">
            {isSummarized && (
              <motion.div
                key="summary-count"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.35, type: 'spring', stiffness: 220, damping: 18 } }}
                exit={{ opacity: 0, y: -5, transition: { duration: 0.2 } }}
                className="flex justify-center mt-4 mb-1"
              >
                <span
                  className="text-[10px] px-3 py-1 rounded-full"
                  style={{ background: 'var(--sq-surface)', color: 'var(--sq-text-4)' }}
                >
                  {CHAT_MESSAGES.length} messages → {displayGroups.reduce((a, g) => a + g.length, 0)} summaries
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Compose bar */}
        <ComposeBar />
      </div>
    </div>
  );
}