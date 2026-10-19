import { FaDesktop, FaLightbulb, FaSave } from 'react-icons/fa';

// ONE place that decides which icons appear on the desktop.
// `opens` is the window the icon launches on double-click (null = does nothing yet).
export const DESKTOP_ICONS = [
  { id: 'my-computer', label: 'My Computer', Icon: FaDesktop, opens: 'explorer' },
  { id: 'clues', label: 'Clues', Icon: FaLightbulb, opens: null }, // slice 5
  { id: 'save', label: 'Save', Icon: FaSave, opens: null }, // slice 6
];
