import { useEffect, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { stepLevel, stepTone } from '../lib/constants';

const COOLDOWN_MS = 400;

/**
 * Captures:
 * - Trackpad pinch (ctrlKey + wheel) → compression level
 * - Shift+Scroll → compression level
 * - Ctrl+Shift+Scroll → tone cycling
 * - Mobile: two-finger vertical swipe → compression level
 *
 * Prevents iOS native pinch-to-zoom and Safari tab-grid gesture
 * by unconditionally blocking Safari gesture events and calling
 * preventDefault on two-finger touchmove.
 * Single-finger scroll is unaffected.
 */
export function useGestureCapture(containerRef: React.RefObject<HTMLElement | null>) {
  const cooldownRef = useRef(false);

  // ── Touch state for two-finger swipe detection ─────────────────────
  const touchStateRef = useRef<{
    active: boolean;
    startY: number;
    startDist: number;
    lastLevel: number | null;
  }>({ active: false, startY: 0, startDist: 0, lastLevel: null });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const withCooldown = (fn: () => void) => {
      if (cooldownRef.current) return;
      cooldownRef.current = true;
      setTimeout(() => (cooldownRef.current = false), COOLDOWN_MS);
      fn();
    };

    // ── Wheel (mouse / trackpad) ────────────────────────────────────

    const handleWheel = (e: WheelEvent) => {
      const state = useAppStore.getState();
      if (state.activeTab === 'settings') return;

      const direction: 1 | -1 = e.deltaY > 0 ? 1 : -1;

      // Trackpad pinch: ctrlKey + wheel (without shift)
      if (e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        withCooldown(() => {
          const next = stepLevel(state.currentLevel, direction);
          if (next !== null) state.setCurrentLevel(next);
        });
        return;
      }

      // Ctrl+Shift+Scroll: tone cycling
      if (e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        withCooldown(() => {
          state.setDialVisible(true);
          state.setCurrentTone(stepTone(state.currentTone, direction));
        });
        return;
      }

      // Shift+Scroll: compression
      if (e.shiftKey && !e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        withCooldown(() => {
          const next = stepLevel(state.currentLevel, direction);
          if (next !== null) state.setCurrentLevel(next);
        });
        return;
      }

      // Regular scroll: do nothing, let it pass through
    };

    // ── Touch: two-finger gestures → compression ─────────────────────
    // touchstart is passive (no preventDefault needed).
    // touchmove is NON-passive so we can preventDefault on two-finger
    // touches to block iOS pinch-to-zoom / tab-grid.
    // Single-finger scroll passes through unblocked.

    const SWIPE_THRESHOLD = 120; // px — deliberate gesture required on touchscreens

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const midY = (t0.clientY + t1.clientY) / 2;
        const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
        touchStateRef.current = {
          active: true,
          startY: midY,
          startDist: dist,
          lastLevel: null,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const ts = touchStateRef.current;
      if (!ts.active || e.touches.length !== 2) {
        ts.active = false;
        return;
      }

      // Two fingers detected — prevent native pinch-to-zoom / tab-grid
      e.preventDefault();

      const state = useAppStore.getState();
      if (state.activeTab === 'settings') return;

      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const midY = (t0.clientY + t1.clientY) / 2;
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);

      // If fingers are spreading/pinching more than swiping, treat as
      // compression via pinch rather than ignoring it.
      const distDelta = Math.abs(dist - ts.startDist);
      const yDelta = midY - ts.startY;

      // Use whichever signal is stronger: vertical swipe or pinch distance
      const effectiveDelta = Math.abs(yDelta) >= distDelta
        ? yDelta
        : (dist < ts.startDist ? SWIPE_THRESHOLD : -SWIPE_THRESHOLD);

      if (Math.abs(yDelta) >= SWIPE_THRESHOLD || distDelta >= SWIPE_THRESHOLD) {
        // Pinch-in (fingers closer) = compress (direction 1)
        // Pinch-out (fingers apart) = decompress (direction -1)
        // Swipe down = compress, swipe up = decompress
        const direction: 1 | -1 = effectiveDelta > 0 ? 1 : -1;
        withCooldown(() => {
          const next = stepLevel(state.currentLevel, direction);
          if (next !== null) state.setCurrentLevel(next);
        });
        // Reset start points so sustained gesture can step multiple levels
        ts.startY = midY;
        ts.startDist = dist;
      }
    };

    const handleTouchEnd = () => {
      touchStateRef.current.active = false;
    };

    // ── Safari gesture events ───────────────────────────────────────
    // Always prevent these — on desktop they fire for trackpad pinch
    // (ctrlKey), on mobile Safari they drive native pinch-to-zoom and
    // the "pinch-out to tab grid" gesture.  We own all pinch input.
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    el.addEventListener('gesturestart', preventGesture);
    el.addEventListener('gesturechange', preventGesture);
    el.addEventListener('gestureend', preventGesture);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
      el.removeEventListener('gesturestart', preventGesture);
      el.removeEventListener('gesturechange', preventGesture);
      el.removeEventListener('gestureend', preventGesture);
    };
  }, [containerRef]);
}