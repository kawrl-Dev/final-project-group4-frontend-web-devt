import { useCallback, useEffect, useState } from 'react';
import { getItem } from '../services/gameService';

const WAKING_AFTER_MS = 3000;

// Module-level cache: slug -> item. Lives as long as the page is loaded,
// so going Back to a folder you already opened is instant.
const cache = new Map();

/** Call when leaving /game or logging out so another account never sees stale data. */
export function clearItemCache() {
  cache.clear();
}

/** For later steps (e.g. after solving a lock): replace or drop one cached item. */
export function setCachedItem(slug, item) {
  cache.set(slug, item);
}
export function invalidateItem(slug) {
  cache.delete(slug);
}

export function useItem(slug) {
  // Latest failure, tagged with the slug it belongs to.
  const [failure, setFailure] = useState({ slug: null, error: null });
  // Slug that has been pending longer than WAKING_AFTER_MS.
  const [slowSlug, setSlowSlug] = useState(null);
  // Bumped by refetch() to re-run the effect.
  const [reloadKey, setReloadKey] = useState(0);
  // Bumped when a reply lands, so we re-render and read the cache.
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!slug || cache.has(slug)) return;

    const controller = new AbortController();
    const timer = setTimeout(() => setSlowSlug(slug), WAKING_AFTER_MS);

    getItem(slug, controller.signal)
      .then((item) => {
        cache.set(slug, item);
        setTick((t) => t + 1);
      })
      .catch((error) => {
        if (controller.signal.aborted) return; // we moved on, ignore
        setFailure({ slug, error });
      })
      .finally(() => {
        clearTimeout(timer);
        if (!controller.signal.aborted) setSlowSlug(null);
      });

    return () => {
      controller.abort(); // a slow reply from a folder we left can't overwrite the current one
      clearTimeout(timer);
    };
  }, [slug, reloadKey]);

  const refetch = useCallback(() => {
    if (slug) cache.delete(slug);
    setFailure({ slug: null, error: null });
    setReloadKey((k) => k + 1);
  }, [slug]);

  const item = slug ? cache.get(slug) ?? null : null;
  const error = !item && failure.slug === slug ? failure.error : null;
  const loading = !!slug && !item && !error;
  const waking = loading && slowSlug === slug;

  return { item, loading, error, waking, refetch };
}