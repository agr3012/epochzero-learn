// hooks/useProctor.ts
'use client';

import { useEffect, useCallback } from 'react';

export type ViolationType =
  | 'fullscreen_exit'
  | 'tab_switch'
  | 'copy_attempt'
  | 'no_face'
  | 'multiple_faces'
  | 'webcam_lost';

interface Options {
  enabled:     boolean;
  onViolation: (type: ViolationType) => void;
}

export function useProctor({ enabled, onViolation }: Options) {

  // ── Fullscreen helper ───────────────────────────────────────────────────
  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement)
        await document.documentElement.requestFullscreen();
    } catch { /* user denied — handled by gate */ }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {}
  }, []);

  // ── Active monitoring ───────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    // Block copy / cut / right-click / text-select
    const prevent = (e: Event) => e.preventDefault();

    // Block keyboard shortcuts
    function onKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      const key  = e.key.toLowerCase();

      // Ctrl+C → copy attempt
      if (ctrl && key === 'c') {
        e.preventDefault();
        onViolation('copy_attempt');
        return;
      }

      // Blocked keys (no violation, just blocked)
      if (
        (ctrl && ['v', 'p', 'u', 'a', 's', 'x'].includes(key)) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(key))
      ) {
        e.preventDefault();
      }
    }

    // Fullscreen exit
    function onFSChange() {
      if (!document.fullscreenElement) onViolation('fullscreen_exit');
    }

    // Tab switch / window blur
    function onVisibility() {
      if (document.hidden) onViolation('tab_switch');
    }

    document.addEventListener('copy',          prevent);
    document.addEventListener('cut',           prevent);
    document.addEventListener('contextmenu',   prevent);
    document.addEventListener('selectstart',   prevent);
    document.addEventListener('keydown',       onKeyDown);
    document.addEventListener('fullscreenchange', onFSChange);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('copy',          prevent);
      document.removeEventListener('cut',           prevent);
      document.removeEventListener('contextmenu',   prevent);
      document.removeEventListener('selectstart',   prevent);
      document.removeEventListener('keydown',       onKeyDown);
      document.removeEventListener('fullscreenchange', onFSChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, onViolation]);

  return { requestFullscreen, exitFullscreen };
}
