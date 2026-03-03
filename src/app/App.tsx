import { useRef, useEffect } from 'react';
import { TabBar } from './components/TabBar';
import { TabContent } from './components/TabContent';
import { LevelIndicator } from './components/LevelIndicator';
import { ToneDial } from './components/ToneDial';
import { Onboarding } from './components/Onboarding';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useGestureCapture } from './hooks/useGestureCapture';
import { useAppStore } from './stores/appStore';

export default function App() {
  const theme = useAppStore((s) => s.theme);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);

  // Sync theme to <html> so radix portals (tooltips, selects, etc.)
  // inherit correct CSS custom-property values
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Lock viewport scale to prevent iOS pinch-to-zoom at the browser level
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
  }, []);

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  return <MainApp />;
}

/** Extracted so gesture/keyboard hooks only mount when the content div exists. */
function MainApp() {
  const contentRef = useRef<HTMLDivElement>(null);
  const theme = useAppStore((s) => s.theme);
  const activeTab = useAppStore((s) => s.activeTab);

  useKeyboardControls();
  useGestureCapture(contentRef);

  return (
    <div
      data-theme={theme}
      className={`size-full flex flex-col overflow-hidden select-none ${theme === 'dark' ? 'dark' : ''}`}
      style={{ background: 'var(--sq-bg)', color: 'var(--sq-text)' }}
    >
      <TabBar />
      <div
        ref={contentRef}
        className={`flex-1 min-h-0 ${activeTab === 'notes' || activeTab === 'chat' ? 'overflow-hidden flex flex-col' : 'overflow-auto'}`}
        style={{ touchAction: 'manipulation' }}
      >
        <TabContent />
      </div>
      <LevelIndicator />
      {/* ToneDial hidden — tone adjustment disabled */}
      {/* <ToneDial /> */}
    </div>
  );
}