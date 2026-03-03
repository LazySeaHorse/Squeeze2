import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, LEVEL_LABELS } from '../stores/appStore';
import { LEVELS, SPRING_CONTAINER, SPRING_PILL } from '../lib/constants';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

export function LevelIndicator() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const isLocked = useAppStore((s) => s.isLocked);
  const showSetting = useAppStore((s) => s.settings.showLevelIndicator);
  const activeTab = useAppStore((s) => s.activeTab);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const prevLevelRef = useRef(currentLevel);

  useEffect(() => {
    if (prevLevelRef.current !== currentLevel) {
      prevLevelRef.current = currentLevel;
      setVisible(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 1500);
    }
    return () => clearTimeout(timerRef.current);
  }, [currentLevel]);

  if (!showSetting || activeTab === 'settings') return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5"
          initial={{ opacity: 0, x: 8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 8, scale: 0.95 }}
          transition={{ type: 'spring', ...SPRING_CONTAINER }}
        >
          {LEVELS.map((lvl, i) => (
            <motion.div
              key={lvl}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[12px]"
              style={{
                fontWeight: currentLevel === lvl ? 700 : 400,
                background: currentLevel === lvl ? 'var(--sq-invert)' : 'var(--sq-surface-hover)',
                color: currentLevel === lvl ? 'var(--sq-invert-text)' : 'var(--sq-text-3)',
              }}
              initial={{ opacity: 0, x: 6 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: currentLevel === lvl ? 1.06 : 1,
              }}
              transition={{
                type: 'spring',
                ...SPRING_PILL,
                delay: i * 0.025,
              }}
            >
              {lvl === -1 ? '-1' : lvl}
            </motion.div>
          ))}
          <motion.div
            className="mt-1 text-[10px] tracking-wide uppercase text-center"
            style={{ color: 'var(--sq-text-3)' }}
            key={currentLevel}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26, delay: 0.06 }}
          >
            {LEVEL_LABELS[currentLevel]}
          </motion.div>
          {isLocked && (
            <motion.div
              className="mt-0.5 text-[9px] tracking-wider uppercase"
              style={{ color: 'var(--sq-lock-text)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Locked
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}