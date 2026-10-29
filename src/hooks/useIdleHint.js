import { useCallback, useEffect, useState } from 'react';
import { useWindows } from './useWindows';
import { IDLE_HINT_DELAY_MS, shouldShowIdleHint } from '../lib/idleHint';

export function useIdleHint() {
  const { state } = useWindows();
  const [idleMs, setIdleMs] = useState(0);
  const [openedOnce, setOpenedOnce] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  if (state.openWindow?.id === 'explorer' && !openedOnce) setOpenedOnce(true);

  const fresh = state.solved.length === 0 && state.readDocuments.length === 0;
  const windowOpen = !!state.openWindow;
  const eligible = fresh && !openedOnce && !windowOpen && !state.paused && !state.finished;

  useEffect(() => {
    if (!eligible) return;
    let timer;

    // Restart the idle countdown on every click or key press.
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIdleMs(IDLE_HINT_DELAY_MS), IDLE_HINT_DELAY_MS);
    };
    const onActivity = () => {
      setIdleMs(0);
      arm();
    };

    arm();
    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('keydown', onActivity);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
      setIdleMs(0);
    };
  }, [eligible, resetKey]);

  // Hover or focus on the icon counts as activity.
  const resetIdle = useCallback(() => setResetKey((k) => k + 1), []);

  const showHint = shouldShowIdleHint({
    idleMs, openedOnce, fresh, windowOpen, paused: state.paused, finished: state.finished,
  });

  return { showHint, resetIdle };
}