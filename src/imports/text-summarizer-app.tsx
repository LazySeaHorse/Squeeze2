import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWheel, usePinch } from '@use-gesture/react';
import { texts } from './texts';
import { useTextDiff } from './useTextDiff';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const wordVariants: any = {
  initial: { 
    opacity: 0, 
    scale: 0.8,
    y: 8,
    filter: "blur(0px)"
  },
  animate: (customDelay: number) => ({ 
    opacity: 1, 
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      opacity: { duration: 0.8, delay: customDelay },
      scale: { type: "spring", stiffness: 200, damping: 20, delay: customDelay },
      y: { type: "spring", stiffness: 200, damping: 20, delay: customDelay },
      filter: { duration: 0.8, delay: customDelay }
    }
  }),
  exit: (customDelay: number) => ({ 
    opacity: 0, 
    scale: 0.85,
    y: -8,
    filter: "blur(4px)",
    transition: {
      duration: 0.8,
      delay: customDelay * 0.5,
      ease: [0.32, 0.72, 0, 1]
    }
  })
};

// Word logic moved inline

export default function App() {
  const [level, setLevel] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const tokens = useTextDiff(texts, level);

  // Throttling references for gestures
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  const pinchTimeout = useRef<NodeJS.Timeout | null>(null);

  useWheel(({ event, direction: [dx, dy] }) => {
    // Desktop interaction: Shift + Scroll
    if (!event.shiftKey) return;
    event.preventDefault(); // Prevent default browser scrolling when shift is held

    if (wheelTimeout.current) return;
    
    // Some browsers map Shift+Scroll to horizontal scroll (dx)
    const activeDir = dy !== 0 ? dy : dx;
    if (activeDir === 0) return;

    wheelTimeout.current = setTimeout(() => {
      wheelTimeout.current = null;
    }, 400); // Debounce to prevent rapid skipping

    if (activeDir > 0) {
      setLevel((l) => Math.min(l + 1, texts.length - 1)); // Advance summarization
    } else if (activeDir < 0) {
      setLevel((l) => Math.max(l - 1, 0)); // Reverse summarization
    }
  }, {
    target: containerRef,
    eventOptions: { passive: false }
  });

  usePinch(({ movement: [md], cancel }) => {
    // Touchscreen interaction: Pinch in (negative movement) -> Summarize more
    // Pinch out (positive movement) -> Summarize less
    
    if (pinchTimeout.current) return;

    // A threshold of movement required to trigger the change
    if (Math.abs(md) > 40) {
      if (md < 0) {
        setLevel((l) => Math.min(l + 1, texts.length - 1));
      } else {
        setLevel((l) => Math.max(l - 1, 0));
      }
      
      cancel(); // Stop tracking until new gesture
      
      pinchTimeout.current = setTimeout(() => {
        pinchTimeout.current = null;
      }, 800);
    }
  }, {
    target: containerRef,
    eventOptions: { passive: false }
  });

  // Level names for UI indicators
  const levelNames = ["Full", "Small", "Smallest", "Tiny"];

  return (
    <div 
      className="min-h-screen bg-[#FDFCFB] text-[#1D1D1F] flex flex-col items-center justify-center font-sans overflow-hidden antialiased"
    >
      <div 
        ref={containerRef}
        className="w-full max-w-4xl mx-auto flex flex-col justify-start px-8 md:px-16 py-24"
        style={{ minHeight: '100vh' }}
      >
        <header className="mb-12 flex items-center justify-between opacity-50 select-none">
          <div className="text-sm font-medium tracking-wide text-stone-500">
            Shift + Scroll / Pinch
          </div>
          <div className="flex gap-2">
            {levelNames.map((name, i) => (
              <div 
                key={name}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === level ? "w-8 bg-stone-800" : "w-2 bg-stone-300"
                )}
              />
            ))}
          </div>
        </header>

        <div className="relative w-full">
          <motion.div 
            className="text-2xl md:text-3xl lg:text-4xl font-normal leading-relaxed text-stone-800"
            style={{ 
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' 
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {tokens.map((token, index) => {
                const isSpace = /^\s+$/.test(token.text);
                const wavePosition = (index / Math.max(tokens.length, 1)) * Math.PI * 3; 
                const delay = Math.abs(Math.sin(wavePosition)) * 0.45;

                if (isSpace) {
                  return (
                    <motion.span
                      key={token.id}
                      layout="position"
                      className="inline-block whitespace-pre"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.4 } }}
                      transition={{
                        layout: { type: "spring", bounce: 0, duration: 1.8, delay: delay * 0.3 },
                        opacity: { duration: 0.6 }
                      }}
                    >
                      {token.text}
                    </motion.span>
                  );
                }

                return (
                  <motion.span
                    key={token.id}
                    layout="position"
                    className="inline-block tracking-tight"
                    custom={delay}
                    variants={wordVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{
                      layout: { type: "spring", bounce: 0, duration: 1.8, delay: delay * 0.3 }
                    }}
                  >
                    {token.text}
                  </motion.span>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
