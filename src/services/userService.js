import { api } from './api';

const BASE = '/api/users';

/** GET /api/users. Returns [{ _id, username, role, createdAt }], sorted by username. */
export function getUsers(signal) {
  return api(BASE, { signal });
}

/**
 * DELETE /api/users/:id. Removes the player plus their saves and scores.
 * The server refuses admin accounts (403) and your own account (400).
 */
export function deleteUser(id, signal) {
  return api(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE', signal });
}
