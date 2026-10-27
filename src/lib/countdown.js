// Helpers for the "too many attempts" countdown. Pure, so node:test can run them.
export const DEFAULT_RETRY_SECONDS = 60;
export const MAX_RETRY_SECONDS = 300;

const positive = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.ceil(n) : null;
};

/** Seconds to wait after a 429. Body wins, then the Retry-After header, then a default. Capped. */
export function parseRetryAfter(body, headerValue) {
  const secs = positive(body?.retryAfterSeconds) ?? positive(headerValue) ?? DEFAULT_RETRY_SECONDS;
  return Math.min(secs, MAX_RETRY_SECONDS);
}

/** Whole seconds until `untilMs` (never negative). null/NaN means no wait. */
export function secondsLeft(untilMs, nowMs) {
  if (!Number.isFinite(untilMs)) return 0;
  return Math.max(0, Math.ceil((untilMs - nowMs) / 1000));
}
