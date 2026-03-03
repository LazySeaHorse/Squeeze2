import { create } from 'zustand';

export type TabId = 'code' | 'news' | 'social' | 'chat' | 'notes' | 'settings';
export type CompressionLevel = 0 | 1 | 2 | 3;
export type TonePreset = 'normal' | 'eli5' | 'noJargon' | 'bullets';
export type Theme = 'dark' | 'light';

export const TONE_LABELS: Record<TonePreset, string> = {
  normal: 'Normal',
  eli5: 'ELI5',
  noJargon: 'No Jargon',
  bullets: 'Bullet Points',
};

export const LEVEL_LABELS: Record<CompressionLevel, string> = {
  0: 'Original',
  1: 'Summary',
  2: 'Brief',
  3: 'Keywords',
};

export interface Settings {
  openRouterKey: string;
  groqKey: string;
  selectedModel: string;
  showLevelIndicator: boolean;
}

const defaultSettings: Settings = {
  openRouterKey: '',
  groqKey: '',
  selectedModel: 'llama-3.3-70b-versatile',
  showLevelIndicator: true,
};

const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem('squeeze-settings');
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {}
  return defaultSettings;
};

const loadTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('squeeze-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'dark';
};

const loadOnboarding = (): boolean => {
  try {
    return localStorage.getItem('squeeze-onboarding-done') === 'true';
  } catch {}
  return false;
};

interface AppState {
  // Onboarding
  onboardingComplete: boolean;
  completeOnboarding: () => void;

  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Theme
  theme: Theme;
  toggleTheme: () => void;

  // Compression
  currentLevel: CompressionLevel;
  setCurrentLevel: (level: CompressionLevel) => void;
  isLocked: boolean;
  toggleLock: () => void;

  // Tone
  currentTone: TonePreset;
  setCurrentTone: (tone: TonePreset) => void;
  isDialVisible: boolean;
  setDialVisible: (v: boolean) => void;

  // Settings
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Onboarding
  onboardingComplete: loadOnboarding(),
  completeOnboarding: () => {
    try { localStorage.setItem('squeeze-onboarding-done', 'true'); } catch {}
    set({ onboardingComplete: true });
  },

  // Navigation
  activeTab: 'news',
  setActiveTab: (tab) =>
    set({ activeTab: tab, currentLevel: 0, isLocked: false }),

  // Theme
  theme: loadTheme(),
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('squeeze-theme', next); } catch {}
      return { theme: next };
    }),

  // Compression
  currentLevel: 0,
  setCurrentLevel: (level) => {
    if (get().isLocked) return;
    set({ currentLevel: level });
  },
  isLocked: false,
  toggleLock: () => set((s) => ({ isLocked: !s.isLocked })),

  // Tone
  currentTone: 'normal',
  setCurrentTone: (_tone) => {/* tone adjustment disabled */},
  isDialVisible: false,
  setDialVisible: (v) => set({ isDialVisible: v }),

  // Settings
  settings: loadSettings(),
  updateSettings: (partial) =>
    set((s) => {
      const next = { ...s.settings, ...partial };
      try {
        localStorage.setItem('squeeze-settings', JSON.stringify(next));
      } catch {}
      return { settings: next };
    }),
}));