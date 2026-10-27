import { useCallback, useEffect, useState } from 'react';
import { secondsLeft } from '../lib/countdown';

/**
 * A once-per-second countdown. start(seconds) begins it; `left` is whole seconds remaining (0 = idle).
 * The timer only runs while there is time left, and is cleaned up on unmount.
 */
export function useCountdown() {
  const [until, setUntil] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const left = secondsLeft(until, now);
  const counting = left > 0;

  useEffect(() => {
    if (!counting) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [counting]);

  const start = useCallback((seconds) => {
    const t = Date.now();
    setNow(t);
    setUntil(t + seconds * 1000);
  }, []);

  return { left, start };
}
