import { useCallback, useEffect, useState } from 'react';
import { deleteUser, getUsers } from '../services/userService';

const WAKING_AFTER_MS = 3000;

export function useAdminUsers({ enabled = true } = {}) {
  const [state, setState] = useState({ users: [], error: null, key: null });
  const [reloadKey, setReloadKey] = useState(0);
  const [slow, setSlow] = useState(false);

  const requestKey = String(reloadKey);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    const timer = setTimeout(() => setSlow(true), WAKING_AFTER_MS);

    getUsers(controller.signal)
      .then((users) => setState({ users, error: null, key: requestKey }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState((s) => ({ ...s, error, key: requestKey }));
      })
      .finally(() => {
        clearTimeout(timer);
        if (!controller.signal.aborted) setSlow(false);
      });

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [enabled, requestKey]);

  const loading = state.key !== requestKey;
  const error = loading ? null : state.error;
  const waking = loading && slow;

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  const removeUser = useCallback(async (id) => {
    await deleteUser(id);
    setState((s) => ({ ...s, users: s.users.filter((u) => u._id !== id) }));
  }, []);

  return { users: state.users, loading, error, waking, refetch, removeUser };
}
