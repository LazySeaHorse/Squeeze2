import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, TONE_LABELS, type TonePreset } from '../stores/appStore';
import { Baby, MessageSquareText, List, Minus } from 'lucide-react';
import { TONES, SPRING_PILL_TIGHT, SPRING_CONTAINER } from '../lib/constants';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

const TONE_ICONS: Record<TonePreset, React.ComponentType<{ className?: string }>> = {
  normal: Minus,
  eli5: Baby,
  noJargon: MessageSquareText,
  bullets: List,
};

export function ToneDial() {
  const isDialVisible = useAppStore((s) => s.isDialVisible);
  const currentTone = useAppStore((s) => s.currentTone);
  const setCurrentTone = useAppStore((s) => s.setCurrentTone);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isDialVisible) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        useAppStore.getState().setDialVisible(false);
      }, 2000);
    }
    return () => clearTimeout(timerRef.current);
  }, [isDialVisible, currentTone]);

  return (
    <AnimatePresence>
      {isDialVisible && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-50 flex items-center gap-0.5 rounded-[20px] px-1.5 py-1.5"
          style={{
            background: 'var(--sq-bg-bar)',
            border: '1px solid var(--sq-border-2)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, y: 12, x: '-50%', scale: 0.92 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: 6, x: '-50%', scale: 0.95 }}
          transition={{ type: 'spring', ...SPRING_CONTAINER }}
        >
          {TONES.map((tone) => {
            const isActive = currentTone === tone;
            const Icon = TONE_ICONS[tone];

            return (
              <Tooltip key={tone}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setCurrentTone(tone);
                      clearTimeout(timerRef.current);
                      timerRef.current = setTimeout(() => {
                        useAppStore.getState().setDialVisible(false);
                      }, 1200);
                    }}
                    className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-[12px] transition-colors"
                    style={{
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? 'var(--sq-invert-text)' : 'var(--sq-text-3)',
                    }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: 'var(--sq-invert)' }}
                        layoutId="tone-dial-pill"
                        transition={{ type: 'spring', ...SPRING_PILL_TIGHT }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10 hidden sm:inline">{TONE_LABELS[tone]}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="sm:hidden">
                  {TONE_LABELS[tone]}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}