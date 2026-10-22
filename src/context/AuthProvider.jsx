import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { api } from '../services/api';
import { clearToken, getToken, saveToken } from '../lib/auth';
import { clearItemCache } from '../hooks/useItem';

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

  const login = useCallback(async (token) => {
    saveToken(token);
    try {
      const me = await api('/api/auth/me');
      setUser({ id: me.id, username: me.username, role: me.role });
    } catch (err) {
      clearToken(); // don't keep a token we couldn't verify
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearItemCache();
    setUser(null);
  }, []);

  const value = { user, setUser, isAdmin: user?.role === 'admin', loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}