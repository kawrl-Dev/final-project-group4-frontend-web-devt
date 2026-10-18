import { createContext } from 'react';

// TEMPORARY: replace with the real auth context once login is wired up.
// Shape the leaderboard relies on: { user: { userID, username, role }, setUser, isAdmin }
export const AuthContext = createContext(null);

export const MOCK_USERS = {
  player: { userID: 'u3', username: 'Kawrl', role: 'player' },
  admin: { userID: 'admin1', username: 'AdminOne', role: 'admin' },
};
