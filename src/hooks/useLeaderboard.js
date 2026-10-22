import { useCallback, useEffect, useState } from 'react';
import {
  deleteEntry,
  getLeaderboard,
  submitScore,
  updateEntryScore,
} from '../services/leaderboardService';

const WAKING_AFTER_MS = 3000;

const byScore = (a, b) => b.score - a.score;

export function useLeaderboard({ all = false, enabled = true } = {}) {
  const [state, setState] = useState({ entries: [], error: null, key: null });
  const [reloadKey, setReloadKey] = useState(0);
  const [slow, setSlow] = useState(false);

  const requestKey = `${all}|${reloadKey}`;

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    const timer = setTimeout(() => setSlow(true), WAKING_AFTER_MS);

    getLeaderboard({ all }, controller.signal)
      .then((entries) => setState({ entries, error: null, key: requestKey }))
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
  }, [all, enabled, requestKey]);

  const loading = state.key !== requestKey;
  const error = loading ? null : state.error;
  const waking = loading && slow;

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  const removeEntry = useCallback(async (id) => {
    await deleteEntry(id);
    setState((s) => ({ ...s, entries: s.entries.filter((e) => e._id !== id) }));
  }, []);

  const updateScore = useCallback(async (id, newScore) => {
    const updated = await updateEntryScore(id, newScore);
    setState((s) => ({
      ...s,
      entries: s.entries
        .map((e) => (e._id === id ? { ...e, ...updated } : e))
        .sort(byScore),
    }));
  }, []);

  const submitMyScore = useCallback(async () => {
    const entry = await submitScore();
    refetch();
    return entry;
  }, [refetch]);

  return {
    entries: state.entries, 
    loading, error, waking, 
    refetch, removeEntry, 
    updateScore, submitMyScore 
  };
}