import { createContext } from 'react';

export const AuthContext = createContext(null);

export const MOCK_USERS = {
  player: { id: 'u3', username: 'Kawrl', role: 'player' },
  admin: { id: 'admin1', username: 'AdminOne', role: 'admin' },
};