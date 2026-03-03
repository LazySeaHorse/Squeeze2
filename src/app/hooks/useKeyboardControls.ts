import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { LEVELS, stepLevel, stepTone } from '../lib/constants';

export function useKeyboardControls() {
  const setCurrentLevel = useAppStore((s) => s.setCurrentLevel);
  const setCurrentTone = useAppStore((s) => s.setCurrentTone);
  const toggleLock = useAppStore((s) => s.toggleLock);
  const activeTab = useAppStore((s) => s.activeTab);

  useEffect(() => {
    if (activeTab === 'settings') return;

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const state = useAppStore.getState();

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          const next = stepLevel(state.currentLevel, 1);
          if (next !== null) setCurrentLevel(next);
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const next = stepLevel(state.currentLevel, -1);
          if (next !== null) setCurrentLevel(next);
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          setCurrentTone(stepTone(state.currentTone, 1));
          state.setDialVisible(true);
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          setCurrentTone(stepTone(state.currentTone, -1));
          state.setDialVisible(true);
          break;
        }
        case ' ': {
          e.preventDefault();
          toggleLock();
          break;
        }
        case '1':
        case '2':
        case '3':
        case '4': {
          e.preventDefault();
          const levelIdx = parseInt(e.key) - 1;
          if (LEVELS[levelIdx] !== undefined) setCurrentLevel(LEVELS[levelIdx]);
          break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab, setCurrentLevel, setCurrentTone, toggleLock]);
}
