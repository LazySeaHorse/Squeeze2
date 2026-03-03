import { Code2, Newspaper, Users, MessageCircle, StickyNote, Settings, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore, type TabId } from '../stores/appStore';
import { SPRING_TAB } from '../lib/constants';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { buttonVariants } from './ui/button';

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function TabBar() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <nav
      className="sticky top-0 z-40 flex items-center gap-1 px-5 py-3"
      style={{
        background: 'var(--sq-bg-bar)',
        borderBottom: '1px solid var(--sq-border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Logo */}
      <div className="mr-4 flex items-center gap-2.5 select-none">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sponge body — squeezed in the middle */}
          <path
            d="M4 8C4 6.5 5 5.5 7 5.5H21C23 5.5 24 6.5 24 8V10C24 10 22 11.5 20.5 12C19 12.5 17 12.5 14 12.5C11 12.5 9 12.5 7.5 12C6 11.5 4 10 4 10V8Z"
            fill="var(--sq-accent)"
            opacity="0.85"
          />
          <path
            d="M4 18C4 18 6 16.5 7.5 16C9 15.5 11 15.5 14 15.5C17 15.5 19 15.5 20.5 16C22 16.5 24 18 24 18V20C24 21.5 23 22.5 21 22.5H7C5 22.5 4 21.5 4 20V18Z"
            fill="var(--sq-accent)"
            opacity="0.85"
          />
          {/* Squeezed waist */}
          <path
            d="M7.5 12C9 12.5 11 12.5 14 12.5C17 12.5 19 12.5 20.5 12C20.5 12 19 14 14 14C9 14 7.5 12 7.5 12Z"
            fill="var(--sq-accent)"
            opacity="0.55"
          />
          <path
            d="M7.5 16C9 15.5 11 15.5 14 15.5C17 15.5 19 15.5 20.5 16C20.5 16 19 14 14 14C9 14 7.5 16 7.5 16Z"
            fill="var(--sq-accent)"
            opacity="0.55"
          />
          {/* Water drops */}
          <circle cx="10" cy="25" r="1" fill="var(--sq-accent)" opacity="0.6" />
          <circle cx="14" cy="26.5" r="1.2" fill="var(--sq-accent)" opacity="0.5" />
          <circle cx="18" cy="25.5" r="0.8" fill="var(--sq-accent)" opacity="0.55" />
          {/* Sponge holes — top half */}
          <circle cx="9" cy="8" r="1" fill="var(--sq-bg)" opacity="0.5" />
          <circle cx="14" cy="7.5" r="1.2" fill="var(--sq-bg)" opacity="0.45" />
          <circle cx="19" cy="8.2" r="0.9" fill="var(--sq-bg)" opacity="0.5" />
          <circle cx="11.5" cy="10" r="0.7" fill="var(--sq-bg)" opacity="0.4" />
          <circle cx="16.5" cy="9.8" r="0.8" fill="var(--sq-bg)" opacity="0.4" />
          {/* Sponge holes — bottom half */}
          <circle cx="9.5" cy="19.5" r="1" fill="var(--sq-bg)" opacity="0.5" />
          <circle cx="14" cy="20" r="1.1" fill="var(--sq-bg)" opacity="0.45" />
          <circle cx="18.5" cy="19" r="0.9" fill="var(--sq-bg)" opacity="0.5" />
          <circle cx="11" cy="17.5" r="0.7" fill="var(--sq-bg)" opacity="0.4" />
          <circle cx="17" cy="17.8" r="0.8" fill="var(--sq-bg)" opacity="0.4" />
          {/* Squeeze pressure arrows */}
          <path d="M2 10L4.5 11.5V8.5L2 10Z" fill="var(--sq-text-3)" opacity="0.35" />
          <path d="M26 10L23.5 8.5V11.5L26 10Z" fill="var(--sq-text-3)" opacity="0.35" />
          <path d="M2 18L4.5 19.5V16.5L2 18Z" fill="var(--sq-text-3)" opacity="0.35" />
          <path d="M26 18L23.5 16.5V19.5L26 18Z" fill="var(--sq-text-3)" opacity="0.35" />
        </svg>
        <span className="text-[13px] tracking-wide hidden lg:inline" style={{ fontWeight: 600, color: 'var(--sq-text)' }}>
          SQUEEZE
        </span>
      </div>

      {/* Tabs */}
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveTab(id)}
                className="relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] transition-colors"
                style={{
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--sq-text)' : 'var(--sq-text-3)',
                }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'var(--sq-surface-active)' }}
                    layoutId="tab-bg"
                    transition={{ type: 'spring', ...SPRING_TAB }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="hidden sm:inline relative z-10">{label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="sm:hidden">
              {label}
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            className={buttonVariants({ variant: 'ghost', size: 'icon' }) + ' w-8 h-8 rounded-lg'}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </TooltipContent>
      </Tooltip>
    </nav>
  );
}
