import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, LEVEL_LABELS, TONE_LABELS } from '../stores/appStore';
import { CodeTab } from './tabs/CodeTab';
import { NewsTab } from './tabs/NewsTab';
import { SocialTab } from './tabs/SocialTab';
import { ChatTab } from './tabs/ChatTab';
import { NotesTab } from './tabs/NotesTab';
import { SettingsTab } from './tabs/SettingsTab';
import { Badge } from './ui/badge';

export function TabContent() {
  const activeTab = useAppStore((s) => s.activeTab);
  const currentLevel = useAppStore((s) => s.currentLevel);
  const currentTone = useAppStore((s) => s.currentTone);
  const isLocked = useAppStore((s) => s.isLocked);

  const isFullWidth = activeTab === 'notes' || activeTab === 'code' || activeTab === 'chat';
  const isFlexFill = activeTab === 'notes' || activeTab === 'code' || activeTab === 'chat';

  const renderContent = () => {
    switch (activeTab) {
      case 'code':
        return <CodeTab />;
      case 'news':
        return <NewsTab />;
      case 'social':
        return <SocialTab />;
      case 'chat':
        return <ChatTab />;
      case 'notes':
        return <NotesTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-h-0 ${isFullWidth ? 'w-full' : 'p-8 lg:px-12 max-w-4xl mx-auto w-full'}`}>
      {activeTab !== 'settings' && activeTab !== 'notes' && activeTab !== 'code' && activeTab !== 'chat' && activeTab !== 'social' && (
        <motion.div
          className="flex items-center gap-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Badge variant="secondary" className="text-[11px] px-2.5 py-1 rounded-md">
            Level {currentLevel} · {LEVEL_LABELS[currentLevel]}
          </Badge>
          {/* Tone badge hidden — tone adjustment disabled */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <Badge variant="outline" className="text-[11px] px-2.5 py-1 rounded-md" style={{ borderColor: 'var(--sq-lock-text)', color: 'var(--sq-lock-text)' }}>
                Locked
              </Badge>
            </motion.div>
          )}
        </motion.div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className={`flex-1 min-h-0 ${isFlexFill ? 'flex flex-col' : ''}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}