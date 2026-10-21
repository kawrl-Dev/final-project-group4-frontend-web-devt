import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { api } from '../services/api';
import { getToken } from '../lib/auth';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;

    const controller = new AbortController();
    api('/api/auth/me', { signal: controller.signal })
      .then((me) => setUser({ id: me.id, username: me.username, role: me.role }))
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const value = { user, setUser, isAdmin: user?.role === 'admin', loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}