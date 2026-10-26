// Game data layer, now backed by the live API (see api.js).
// Same function names as the old mock, so the screens keep working.
// The answer is checked on the server and never sent to the browser.
import { api } from './api';

/** GET /api/files/:slug. Locked items come back as { locked: true, lock: { prompt, hasHint, hint? } }. */
export function getItem(slug, signal) {
  return api(`/api/files/${encodeURIComponent(slug)}`, { signal });
}

/** POST /api/files/:slug/solve. Returns { correct: true, item } or { correct: false }. */
export function solve(slug, answer, signal) {
  return api(`/api/files/${encodeURIComponent(slug)}/solve`, {
    method: 'POST',
    body: { answer },
    signal,
  });
}
/**
 * POST /api/files/:slug/hint. Returns { hint, score }.
 * The first reveal of each lock costs points on the server; asking again is free.
 */
export function revealHint(slug, signal) {
  return api(`/api/files/${encodeURIComponent(slug)}/hint`, {
    method: 'POST',
    signal,
  });
}
