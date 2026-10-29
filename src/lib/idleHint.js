export const IDLE_HINT_DELAY_MS = 13000;

export function shouldShowIdleHint({ 
        idleMs, openedOnce, fresh, 
        windowOpen, paused, finished 
    }) 
{
  if (openedOnce || !fresh || windowOpen || paused || finished) return false;
  return idleMs >= IDLE_HINT_DELAY_MS;
}