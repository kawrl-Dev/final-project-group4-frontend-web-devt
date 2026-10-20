import { FaDesktop, FaLightbulb } from 'react-icons/fa';

// ONE place that decides which icons appear on the desktop.
// `opens` is the window the icon launches on double-click (null = does nothing yet).
// Saving and loading live in the pause menu (Esc), not on the desktop.
export const DESKTOP_ICONS = [
  { id: 'my-computer', label: 'My Computer', Icon: FaDesktop, opens: 'explorer', windowTitle: 'C:\\' },
  { id: 'clues', label: 'Clues', Icon: FaLightbulb, opens: 'clues', windowTitle: 'Clues' },
];