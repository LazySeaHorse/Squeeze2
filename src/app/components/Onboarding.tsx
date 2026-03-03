import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../stores/appStore';
import { AnimatedText } from './AnimatedText';
import {
  Sun,
  Moon,
  Newspaper,
  MessageSquare,
  Code2,
  StickyNote,
  ArrowUpDown,
  Zap,
  Palette,
  Smartphone,
} from 'lucide-react';

// ── TOS text ─────────────────────────────────────────────────────────

const TOS_TEXT = `TERMS OF COGNITIVE SERVICE AGREEMENT

Effective Date: The moment you opened this app.

BY SCROLLING THROUGH THIS DOCUMENT, YOU ACKNOWLEDGE THAT YOU HAVE BEEN A VICTIM OF INFORMATION OVERLOAD FOR THE BETTER PART OF THE LAST DECADE AND ARE FINALLY READY TO DO SOMETHING ABOUT IT.

ARTICLE I — DEFINITIONS

1.1 "Information Overload" shall refer to the chronic, debilitating condition wherein the human brain is subjected to approximately 34 gigabytes of data per day, roughly equivalent to the storage capacity of a mid-range smartphone from 2012. The irony of this comparison is not lost on us.

1.2 "Doomscrolling" shall mean the compulsive act of consuming endless streams of negative or irrelevant content, typically performed between the hours of 11:47 PM and 2:33 AM while one's partner sleeps peacefully beside them, blissfully unaware that you are reading your fourteenth article about a topic you will forget by morning.

1.3 "Your Brain" shall refer to the 1.4-kilogram organ currently struggling to process this sentence while simultaneously remembering whether you locked the front door, composing a mental grocery list, and replaying an embarrassing thing you said in 2014.

ARTICLE II — ACKNOWLEDGEMENT OF HARM

2.1 You hereby acknowledge that the average human attention span has decreased from 12 seconds in the year 2000 to approximately 8.25 seconds as of 2024, which is — and we cannot stress this enough — shorter than that of a goldfish.

2.2 You further acknowledge that you have, on no fewer than seventeen occasions this month, opened your phone to check one specific thing and then spent forty-five minutes doing something else entirely, ultimately forgetting the original purpose of picking up the device.

2.3 You concede that your short-term memory has been so thoroughly degraded by constant context-switching that you occasionally walk into rooms and stand there, bewildered, like a freshly rebooted computer that has lost its startup sequence.

2.4 You accept that reading long-form content now feels like an extreme sport, and that your brain instinctively searches for a "TL;DR" section in every piece of text longer than a tweet. The fact that you have made it this far into this document is, frankly, remarkable.

ARTICLE III — THE NEUROSCIENCE BIT (TO MAKE THIS SOUND LEGITIMATE)

3.1 Research from the Institute of We Definitely Looked This Up demonstrates that chronic information overload triggers elevated cortisol production, effectively keeping your brain in a persistent state of low-grade fight-or-flight response. Your amygdala thinks a push notification is a predator. It is not. It is a reminder to hydrate.

3.2 The prefrontal cortex, responsible for decision-making and impulse control, shows measurably reduced grey matter density in individuals who consume more than six hours of digital media daily. In layman's terms: scrolling is literally shrinking the part of your brain that tells you to stop scrolling.

3.3 Multitasking — which you are almost certainly doing right now — has been shown to reduce productive thinking capacity by up to 40%. Your brain is not "running multiple processes." It is a single-threaded processor desperately pretending to be a server farm, and it is overheating.

ARTICLE IV — DISCLAIMERS

4.1 Squeeze is not responsible for any existential dread that may arise from confronting the volume of text you consume daily. We merely compress it.

4.2 Squeeze makes no warranty, express or implied, that summarising your content will give you back the years lost to reading email chains that could have been a single sentence.

4.3 If you experience sudden clarity, improved focus, or an unexpected sense of calm while using Squeeze, these are known side effects and will subside once you reopen Twitter.

ARTICLE V — ACCEPTANCE

5.1 By scrolling to the bottom of this agreement (which, let's be honest, is exactly the kind of long-form content Squeeze was designed to compress), you agree that information overload is real, it is affecting your cognition, and you are ready to take back your attention span — one squeeze at a time.

5.2 You waive all rights to complain about the length of this Terms of Service document, on the grounds that its very existence proves the point it's making.`;

// ── Intermediate compression levels ──────────────────────────────────

const LEVEL_1_TEXT =
  'This Terms of Cognitive Service Agreement acknowledges that you suffer from information overload — your brain processes 34 GB of data daily, your attention span is shorter than a goldfish\'s, and you routinely forget why you picked up your phone. Chronic scrolling is literally shrinking your prefrontal cortex, your amygdala treats push notifications as predators, and multitasking has reduced your productive thinking by 40%. Squeeze compresses content to help you reclaim your attention. Side effects of clarity will subside once you reopen Twitter.';

const LEVEL_2_TEXT =
  'You have information overload. Your attention span is 8.25 seconds. Scrolling is shrinking your brain. Squeeze compresses text so you can focus again.';

const LEVEL_3_TEXT = 'Information overload is real. Squeeze fixes it.';

const SQUEEZE_TEXTS = [TOS_TEXT, LEVEL_1_TEXT, LEVEL_2_TEXT, LEVEL_3_TEXT] as const;

// ── Bento feature cards ──────────────────────────────────────────────

const BENTO_CARDS = [
  {
    icon: Newspaper,
    title: 'News articles',
    description: 'Compress walls of text into digestible summaries instantly.',
    span: 'col-span-1',
  },
  {
    icon: MessageSquare,
    title: 'Chat threads',
    description: 'Collapse sprawling conversations into per-person summaries.',
    span: 'col-span-1',
  },
  {
    icon: Code2,
    title: 'Source code',
    description: 'Progressive compression from docstrings to pseudocode to a summary.',
    span: 'col-span-1',
  },
  {
    icon: StickyNote,
    title: 'Your own notes',
    description: 'Write freely, then squeeze to get an AI summary.',
    span: 'col-span-1',
  },
  {
    icon: ArrowUpDown,
    title: '4 compression levels',
    description: 'From the original text down to keywords. Scroll or pinch to move between them.',
    span: 'col-span-1 sm:col-span-2',
  },
  {
    icon: Palette,
    title: 'Compression levels',
    description: 'Squeeze text from full-length to a punchy distillation — each level roughly halves the word count.',
    span: 'col-span-1',
  },
  {
    icon: Smartphone,
    title: 'Touch & keyboard',
    description: 'Two-finger swipe on mobile, Shift+Scroll on desktop, or use the dot indicator.',
    span: 'col-span-1',
  },
  {
    icon: Zap,
    title: 'Instant animations',
    description: 'Word-level diff animations show exactly what changed as you compress.',
    span: 'col-span-1 sm:col-span-2',
  },
];

// ── Component ────────────────────────────────────────────────────────

export function Onboarding() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [screen, setScreen] = useState<1 | 2>(1);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [squeezeLevel, setSqueezeLevel] = useState(0); // 0 = original, 1–3 = compressed
  const [boxDismissed, setBoxDismissed] = useState(false); // textbox animates away after level 3
  const [hintVisible, setHintVisible] = useState(false);
  const squeezeInProgress = useRef(false);
  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const squeezed = squeezeLevel === 3 && boxDismissed;

  // Show hint after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => stepTimers.current.forEach(clearTimeout);
  }, []);

  // Scroll detection
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    if (atBottom && !scrolledToBottom) setScrolledToBottom(true);
  }, [scrolledToBottom]);

  /**
   * Start the stepped compression cascade.
   * Each level waits for the previous diff animation to fully play (~2s),
   * then pauses 1s for reading, before advancing to the next level.
   *
   * Timeline:
   *   t = 0s     → level 1  (huge diff: TOS → paragraph)
   *   t = 3s     → level 2  (animation 2s + 1s reading pause)
   *   t = 5.5s   → level 3  (animation 1.5s + 1s pause)
   *   t = 8s     → dismiss textbox (animation 1.5s + 1s pause)
   */
  const startSqueeze = useCallback(() => {
    if (squeezeInProgress.current || squeezeLevel > 0) return;
    squeezeInProgress.current = true;

    // Step to level 1 immediately (big diff from full TOS → paragraph)
    setSqueezeLevel(1);

    // Level 1 animation ~2s + 1s reading pause = 3s
    const t1 = setTimeout(() => setSqueezeLevel(2), 3000);
    // Level 2 animation ~1.5s + 1s reading pause = 2.5s
    const t2 = setTimeout(() => setSqueezeLevel(3), 5500);
    // Level 3 animation ~1.5s + 1s reading pause = 2.5s, then dismiss box
    const t3 = setTimeout(() => setBoxDismissed(true), 8000);

    stepTimers.current = [t1, t2, t3];
  }, [squeezeLevel]);

  // Squeeze gesture (local handler for onboarding only)
  useEffect(() => {
    if (squeezeLevel > 0) return;

    const handleWheel = (e: WheelEvent) => {
      // Trackpad pinch or Shift+Scroll
      if (e.ctrlKey || e.shiftKey) {
        if (e.deltaY > 0) {
          e.preventDefault();
          e.stopPropagation();
          startSqueeze();
        }
      }
    };

    // Two-finger touch
    let touchStartY = 0;
    let touchActive = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        touchStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        touchActive = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchActive || e.touches.length !== 2) {
        touchActive = false;
        return;
      }
      // Two fingers → prevent native pinch-to-zoom / tab-grid
      e.preventDefault();
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      if (midY - touchStartY > 40) {
        startSqueeze();
        touchActive = false;
      }
    };

    const handleTouchEnd = () => {
      touchActive = false;
    };

    // Block Safari gesture events unconditionally
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('gesturestart', preventGesture);
    window.addEventListener('gesturechange', preventGesture);
    window.addEventListener('gestureend', preventGesture);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('gesturestart', preventGesture);
      window.removeEventListener('gesturechange', preventGesture);
      window.removeEventListener('gestureend', preventGesture);
    };
  }, [squeezeLevel, startSqueeze]);

  const canProceed = squeezed;

  // ── Screen 1: TOS ──────────────────────────────────────────────────

  const renderScreen1 = () => (
    <motion.div
      key="screen1"
      className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-8 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div />
        <div className="flex flex-col items-center gap-1">
          <h1
            className="text-[28px] tracking-tight"
            style={{ color: 'var(--sq-text)' }}
          >
            Welcome to{' '}
            <span style={{ color: 'var(--sq-accent)' }}>Squeeze</span>
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--sq-text-3)' }}>
            Compress the noise. Keep the signal.
          </p>
        </div>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: 'var(--sq-surface-hover)',
            color: 'var(--sq-text-2)',
          }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* TOS scroll box — animates away after final squeeze */}
      <motion.div
        className="w-full overflow-hidden flex flex-col"
        animate={{
          borderRadius: boxDismissed ? 0 : 8,
          borderWidth: boxDismissed ? 0 : 1,
          maxHeight: boxDismissed ? 80 : 'calc(50vh)',
          minHeight: boxDismissed ? 0 : 280,
          opacity: 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 26,
        }}
        style={{
          borderStyle: 'solid',
          borderColor: boxDismissed ? 'transparent' : 'var(--sq-border)',
          background: boxDismissed ? 'transparent' : 'var(--sq-bg)',
        }}
      >
        {/* Header bar — fades out when box dismisses */}
        <motion.div
          className="px-4 py-2.5 shrink-0 flex items-center justify-between"
          animate={{
            opacity: boxDismissed ? 0 : 1,
            height: boxDismissed ? 0 : 'auto',
            paddingTop: boxDismissed ? 0 : 10,
            paddingBottom: boxDismissed ? 0 : 10,
          }}
          transition={{ duration: 0.3 }}
          style={{
            borderBottom: boxDismissed ? 'none' : '1px solid var(--sq-border)',
            background: 'var(--sq-surface)',
            overflow: 'hidden',
          }}
        >
          <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--sq-text-3)' }}>
            Terms of Cognitive Service
          </span>
          <div className="flex items-center gap-2">
            {/* Compression level dots */}
            {squeezeLevel > 0 && (
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((l) => (
                  <div
                    key={l}
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: l <= squeezeLevel ? 'var(--sq-accent)' : 'var(--sq-text-5)',
                    }}
                  />
                ))}
              </div>
            )}
            <span className="text-[10px]" style={{ color: 'var(--sq-text-4)' }}>
              v2.0.0
            </span>
          </div>
        </motion.div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto p-4 ${boxDismissed ? 'flex items-center justify-center' : ''}`}
          style={{ overscrollBehavior: 'contain' }}
        >
          <AnimatedText
            text={SQUEEZE_TEXTS[squeezeLevel]}
            className={`text-[13px] whitespace-pre-wrap ${boxDismissed ? 'text-center' : ''}`}
            style={{
              lineHeight: '1.75',
              color: boxDismissed ? 'var(--sq-accent)' : 'var(--sq-text-2)',
              fontWeight: boxDismissed ? 500 : undefined,
              transition: 'color 0.4s ease',
            }}
          />
        </div>
      </motion.div>

      {/* Hint */}
      <AnimatePresence>
        {hintVisible && squeezeLevel === 0 && (
          <motion.div
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
            style={{
              background: 'var(--sq-accent-dim)',
              border: '1px solid var(--sq-accent)',
            }}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <ArrowUpDown size={14} style={{ color: 'var(--sq-accent)' }} />
            <span className="text-[13px]" style={{ color: 'var(--sq-accent)' }}>
              Try squeezing!{' '}
              <span style={{ opacity: 0.7 }}>
                Shift + Scroll · Pinch · Two-finger swipe
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success message when fully squeezed */}
      <AnimatePresence>
        {squeezed && (
          <motion.p
            className="text-[13px] text-center"
            style={{ color: 'var(--sq-success-text)' }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
          >
            You just compressed a wall of legal text into one line.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Apply / Let's Go button */}
      <button
        onClick={() => {
          if (canProceed) setScreen(2);
        }}
        disabled={!canProceed}
        className="w-full max-w-xs py-3 rounded-lg text-[14px] transition-all"
        style={{
          background: canProceed ? 'var(--sq-accent)' : 'var(--sq-surface-hover)',
          color: canProceed ? '#ffffff' : 'var(--sq-text-4)',
          cursor: canProceed ? 'pointer' : 'not-allowed',
          opacity: canProceed ? 1 : 0.6,
        }}
      >
        {squeezed ? "Let's Go" : scrolledToBottom ? 'I Accept' : 'Scroll to read'}
      </button>
    </motion.div>
  );

  // ── Screen 2: Bento ────────────────────────────────────────────────

  const renderScreen2 = () => (
    <motion.div
      key="screen2"
      className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-8 gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-2">
        <h1
          className="text-[26px] tracking-tight text-center"
          style={{ color: 'var(--sq-text)' }}
        >
          Squeeze works{' '}
          <span style={{ color: 'var(--sq-accent)' }}>everywhere</span>
        </h1>
        <p className="text-[14px] text-center max-w-md" style={{ color: 'var(--sq-text-3)' }}>
          Any content. Any format. Same intuitive gesture.
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {BENTO_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            className={`rounded-xl p-5 flex flex-col gap-3 ${card.span}`}
            style={{
              background: 'var(--sq-surface)',
              border: '1px solid var(--sq-border)',
            }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 22,
              delay: 0.08 * i,
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--sq-accent-dim)' }}
            >
              <card.icon size={18} style={{ color: 'var(--sq-accent)' }} />
            </div>
            <div>
              <h3
                className="text-[14px] mb-1"
                style={{ color: 'var(--sq-text)' }}
              >
                {card.title}
              </h3>
              <p
                className="text-[12px]"
                style={{ color: 'var(--sq-text-3)', lineHeight: '1.5' }}
              >
                {card.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Get Started */}
      <button
        onClick={completeOnboarding}
        className="w-full max-w-xs py-3 rounded-lg text-[14px] transition-all"
        style={{
          background: 'var(--sq-accent)',
          color: '#ffffff',
          cursor: 'pointer',
        }}
      >
        Get Started
      </button>
    </motion.div>
  );

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div
      data-theme={theme}
      className={`size-full flex items-center justify-center overflow-auto ${theme === 'dark' ? 'dark' : ''}`}
      style={{ background: 'var(--sq-bg)', color: 'var(--sq-text)' }}
    >
      <AnimatePresence mode="wait">
        {screen === 1 ? renderScreen1() : renderScreen2()}
      </AnimatePresence>
    </div>
  );
}