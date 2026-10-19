import { useCallback, useEffect, useState } from 'react';
import { deleteEntry, getLeaderboard, submitScore, updateEntryScore } from '../services/leaderboardService';

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

  // Updates a score and re-sorts the list so placement reflects the change immediately.
  const updateScore = useCallback(async (entryID, newScore) => {
    await updateEntryScore(entryID, newScore);
    setState((s) => {
      const updated = s.entries.map((e) =>
        e.entryID === entryID ? { ...e, score: newScore } : e
      );
      // Re-sort by score descending so rank numbers are correct after the edit.
      updated.sort((a, b) => b.score - a.score);
      return { ...s, entries: updated };
    });
  }, []);

  // Adds a new score entry (called from the game screen after a game ends).
  const addEntry = useCallback(async ({ userID, player, score, completedDate }) => {
    const entry = await submitScore({ userID, player, score, completedDate });
    setState((s) => {
      const updated = [...s.entries, entry];
      updated.sort((a, b) => b.score - a.score);
      // Players only see top 10; admins see all. Slice handled by the page via { all }.
      return { ...s, entries: updated };
    });
    return entry;
  }, []);

  return { ...state, refetch, removeEntry, updateScore, addEntry };
}