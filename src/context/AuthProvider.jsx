import { useState } from 'react';
import { AuthContext } from './AuthContext';

// TEMPORARY provider so the leaderboard can be built and demoed before login exists.
// Swap this out for the real one; only { user, setUser, isAdmin } is needed.
export default function AuthProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser);
  const value = { user, setUser, isAdmin: user?.role === 'admin' };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
