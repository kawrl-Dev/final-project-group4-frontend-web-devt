import { useEffect, useState } from 'react';
import { useWindows } from '../../hooks/useWindows';
import { RAISED, SUNKEN } from './Window95';

const pad = (n) => String(n).padStart(2, '0');

export default function Taskbar() {
  const { state } = useWindows();
  const [seconds, setSeconds] = useState(0);

  // Timer starts when the game page mounts and ticks every second.
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id); // clean up when leaving /game
  }, []);

  const time = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;

  return (
    <div className={`absolute inset-x-0 bottom-0 z-30 flex h-10 items-center gap-2 bg-gray-300 px-2 font-pixel text-black ${RAISED}`}>
      <div className="flex-1">
        {state.openWindow && (
          <span className={`inline-block max-w-48 truncate bg-gray-200 px-3 py-1 text-sm font-bold ${SUNKEN}`}>
            {state.openWindow.title}
          </span>
        )}
      </div>
      <span className={`px-3 py-1 text-sm ${SUNKEN}`}>Score: 0</span>
      <span className={`px-3 py-1 text-sm tabular-nums ${SUNKEN}`}>{time}</span>
    </div>
  );
}
