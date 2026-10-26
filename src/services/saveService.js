// Save data layer. One save slot per player, so the user id is always "me":
// the server takes the real id from the token (never from the browser).
import { api } from './api';

const ME = '/api/saves/me';

/**
 * GET /api/saves/me
 * Returns the Save plus { readDocuments: [{ slug, name }], items }.
 * v2 fields: playerScore (raw, may be negative), startedAt, finishedAt, pausedAt, pausedMs,
 * wrongGuesses, wrongByLock, hintsByLock, verified.
 * No save yet -> throws ApiError with kind 'notFound'.
 */
export function getSave(signal) {
  return api(ME, { signal });
}

/** PUT /api/saves/me. Creates the slot, or overwrites it if one exists. */
export function putSave({ solved, readDocuments }, signal) {
  return api(ME, { method: 'PUT', body: { solved, readDocuments }, signal });
}

/** DELETE /api/saves/me. No save -> ApiError kind 'notFound'. */
export function deleteSave(signal) {
  return api(ME, { method: 'DELETE', signal });
}

/**
 * POST /api/saves/me/pause and /resume. Both are idempotent and return
 * { paused, pausedMs, creditLeftMs, score }. The server measures the pause itself.
 * Pausing before the clock starts, or with no save, is a 200 that changes nothing.
 */
export function pauseRun(signal) {
  return api(`${ME}/pause`, { method: 'POST', signal });
}

export function resumeRun(signal) {
  return api(`${ME}/resume`, { method: 'POST', signal });
}
