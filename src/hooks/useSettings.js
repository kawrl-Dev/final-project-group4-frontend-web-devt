import { useEffect, useState } from 'react';
import { getSettings } from '../lib/settings';

/** Current settings, kept in sync when Settings.jsx saves (it fires 'minosdb-settings'). */
export function useSettings() {
  const [settings, setSettings] = useState(() => getSettings());
  useEffect(() => {
    const sync = () => setSettings(getSettings());
    window.addEventListener('minosdb-settings', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('minosdb-settings', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return settings;
}
