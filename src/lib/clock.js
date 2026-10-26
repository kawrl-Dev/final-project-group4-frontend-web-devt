export const MAX_PAUSE_CREDIT_MS = 10 * 60 * 1000;

const pad = (n) => String(n).padStart(2, '0');

/** 65 -> "01:05", 3725 -> "1:02:05". Junk and negatives show as 00:00. */
export function formatTime(totalSeconds) {
  const s = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}

/**
 * Active play time in whole seconds: end - startedAt - pausedMs, where end is finishedAt or now.
 * While paused the number freezes, but only for as long as the server would still credit
 * (creditLeftMs, or what is left of the 10 minute cap). A pause that began before the clock
 * started is ignored, like the server does.
 * Times are milliseconds since the epoch.
 */
export function activeSeconds({
  startedAt = null, finishedAt = null, pausedAt = null, pausedMs = 0, creditLeftMs = null, now,
}) {
  if (startedAt === null || startedAt === undefined) return 0;
  const paused = Number.isFinite(pausedMs) && pausedMs > 0 ? pausedMs : 0;

  let end = finishedAt ?? now;
  let openPause = 0;
  if (finishedAt === null && pausedAt !== null && pausedAt !== undefined && pausedAt >= startedAt) {
    // The taskbar's `now` can lag up to a second behind the moment the pause began.
    // Never count time before the pause point, or the frozen number would creep up.
    end = Math.max(now, pausedAt);
    const elapsed = Math.max(0, end - pausedAt);
    const left = Number.isFinite(creditLeftMs) ? Math.max(0, creditLeftMs) : Math.max(0, MAX_PAUSE_CREDIT_MS - paused);
    openPause = Math.min(elapsed, left);
  }

  const ms = end - startedAt - paused - openPause;
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 1000)) : 0;
}
