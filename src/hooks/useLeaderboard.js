import { useCallback, useEffect, useState } from 'react';
import { deleteEntry, getLeaderboard } from '../services/leaderboardService';

export function useLeaderboard({ all = false } = {}) {
  const [state, setState] = useState({ entries: [], loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard({ all })
      .then((entries) => {
        if (!cancelled) setState({ entries, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error }));
      });
    return () => {
      cancelled = true;
    };
  }, [all, reloadKey]);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setReloadKey((k) => k + 1);
  }, []);

  const removeEntry = useCallback(async (entryID) => {
    await deleteEntry(entryID);
    setState((s) => ({ ...s, entries: s.entries.filter((e) => e.entryID !== entryID) }));
  }, []);

  return { ...state, refetch, removeEntry };
}
