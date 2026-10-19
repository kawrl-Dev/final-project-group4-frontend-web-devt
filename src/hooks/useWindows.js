import { useContext } from 'react';
import { WindowContext } from '../context/WindowContext';

export function useWindows() {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error('useWindows must be used within WindowProvider');
  return ctx;
}
