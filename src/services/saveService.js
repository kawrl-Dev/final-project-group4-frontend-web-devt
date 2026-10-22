// Save data layer. One save slot per player, so the user id is always "me":
// the server takes the real id from the token (never from the browser).
import { api } from './api';

const ME = '/api/saves/me';

/**
 * GET /api/saves/me
 * Returns { solved, readDocuments: [{ slug, name }], items, updatedAt }.
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