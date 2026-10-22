import { api } from './api';

const BASE = '/api/leaderboard';

export function getLeaderboard({ all = false } = {}, signal) {
  return api(all ? `${BASE}?all=true` : BASE, { signal });
}

export function deleteEntry(id, signal) {
  return api(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE', signal });
}

export function updateEntryScore(id, score, signal) {
  return api(`${BASE}/${encodeURIComponent(id)}`, { method: 'PATCH', body: { score }, signal });
}

export function submitScore(signal) {
  return api(BASE, { method: 'POST', signal });
}