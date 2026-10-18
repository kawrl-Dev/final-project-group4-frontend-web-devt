// Leaderboard data layer. Everything here is MOCK data held in memory.
// When the backend is ready, replace the bodies below with fetch calls
// (see the commented examples). The rest of the app only imports these functions.

// const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
import { MOCK_USERS } from "../context/AuthContext";


const {player}= MOCK_USERS;
let entries = [
  { entryID: 'e1', userID: 'u1', player: 'Cipher', score: 9800, completedDate: '2026-10-10' },
  { entryID: 'e2', userID: 'u2', player: 'NullPointer', score: 9450, completedDate: '2026-10-11' },
  { entryID: 'e3', userID: player.userID, player: player.username, score: 9100, completedDate: '2026-10-12' },
  { entryID: 'e4', userID: 'u4', player: 'Minos', score: 8700, completedDate: '2026-10-12' },
  { entryID: 'e5', userID: 'u5', player: 'Aggregate', score: 8350, completedDate: '2026-10-13' },
  { entryID: 'e6', userID: 'u6', player: 'IndexKey', score: 7900, completedDate: '2026-10-13' },
  { entryID: 'e7', userID: 'u7', player: 'BsonBard', score: 7500, completedDate: '2026-10-14' },
  { entryID: 'e8', userID: 'u8', player: 'Sharded', score: 7200, completedDate: '2026-10-14' },
  { entryID: 'e9', userID: 'u9', player: 'ReplicaSet', score: 6800, completedDate: '2026-10-15' },
  { entryID: 'e10', userID: 'u10', player: 'Cursor', score: 6400, completedDate: '2026-10-15' },
  { entryID: 'e11', userID: 'u11', player: 'Upsert', score: 5900, completedDate: '2026-10-16' },
  { entryID: 'e12', userID: 'u12', player: 'Lookup', score: 5200, completedDate: '2026-10-17' },
  { entryID: 'e13', userID: 'u13', player: 'xX_Dropper_Xx', score: 100, completedDate: '2026-10-17' },
];

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));
 
const sorted = () => [...entries].sort((a, b) => b.score - a.score);
 
/**
 * GET /api/leaderboard
 * Players get the top 10. Admins pass { all: true } to see every entry.
 * Real version: fetch(`${API}/api/leaderboard`, { headers: { Authorization: `Bearer ${token}` } })
 */
export async function getLeaderboard({ all = false } = {}) {
  await delay();
  const list = sorted();
  return all ? list : list.slice(0, 10);
}
 
/**
 * DELETE /api/admin/leaderboard/:entryID  (admin only)
 * Real version: fetch(`${API}/api/admin/leaderboard/${entryID}`, { method: 'DELETE', headers: {...} })
 */
export async function deleteEntry(entryID) {
  await delay(300);
  entries = entries.filter((e) => e.entryID !== entryID);
}
 
/**
 * PATCH /api/admin/leaderboard/:entryID  (admin only)
 * Updates the score of an existing entry and returns the updated entry.
 * Real version: fetch(`${API}/api/admin/leaderboard/${entryID}`, { method: 'PATCH', body: JSON.stringify({ score }), headers: {...} })
 */
export async function updateEntryScore(entryID, newScore) {
  await delay(300);
  const entry = entries.find((e) => e.entryID === entryID);
  if (!entry) throw new Error(`Entry ${entryID} not found`);
  entry.score = newScore;
  return { ...entry };
}
 
/**
 * POST /api/leaderboard  (authenticated player)
 * Submits a new score after a game ends. Returns the created entry.
 * Real version: fetch(`${API}/api/leaderboard`, { method: 'POST', body: JSON.stringify({ score, completedDate }), headers: {...} })
 */
export async function submitScore({ userID, player, score, completedDate }) {
  await delay(300);
  const entryID = `e${Date.now()}`;
  const entry = { entryID, userID, player, score, completedDate };
  entries.push(entry);
  return { ...entry };
}