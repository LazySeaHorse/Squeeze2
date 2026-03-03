import type { CompressionLevel, TonePreset } from '../stores/appStore';

// Ordered arrays — single source of truth
export const LEVELS: CompressionLevel[] = [0, 1, 2, 3];
export const TONES: TonePreset[] = ['normal', 'eli5', 'noJargon', 'bullets'];

// Step helpers for level/tone navigation
export function stepLevel(current: CompressionLevel, direction: 1 | -1): CompressionLevel | null {
  const idx = LEVELS.indexOf(current);
  const next = idx + direction;
  if (next < 0 || next >= LEVELS.length) return null;
  return LEVELS[next];
}

export function stepTone(current: TonePreset, direction: 1 | -1): TonePreset {
  const idx = TONES.indexOf(current);
  return TONES[(idx + direction + TONES.length) % TONES.length];
}

/** Tab/container transitions */
export const SPRING_CONTAINER = { stiffness: 260, damping: 28, mass: 0.9 };

/** Tab bar sliding indicator */
export const SPRING_TAB = { stiffness: 280, damping: 30, mass: 0.9 };

/** Dot/pill indicators (level dots, tone pill) */
export const SPRING_PILL = { stiffness: 300, damping: 28, mass: 0.85 };

/** Dynamic Island–style pill (ToneDial active indicator) */
export const SPRING_PILL_TIGHT = { stiffness: 320, damping: 32, mass: 0.85 };
