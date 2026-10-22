import { useEffect, useState } from 'react';
import { useWindows } from '../../hooks/useWindows';
import { RAISED, SUNKEN } from './Window95';

const pad = (n) => String(n).padStart(2, '0');

const HALF_MARKS = 300;
const WRONG_PENALTY = 50;

const estimateScore = (seconds, wrongGuesses) =>
  Math.max(0, Math.round((1000 * HALF_MARKS) / (HALF_MARKS + seconds)) - WRONG_PENALTY * wrongGuesses);

export default function Taskbar() {
  const { state } = useWindows();
  const { startedAt, finishedAt, finished, wrongGuesses } = state;

  const [now, setNow] = useState(() => Date.now());

  const running = startedAt !== null && finishedAt === null && !finished;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id); // clean up when leaving /game or when the run stops
  }, [running]);

  const end = finishedAt ?? now;
  const seconds = startedAt === null ? 0 : Math.max(0, Math.round((end - startedAt) / 1000));
  const score = estimateScore(seconds, wrongGuesses);

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
      <span
        role="img"
        aria-label={`Estimated score ${score}`}
        title="Estimate only. Your real score is calculated by the server when you submit."
        className={`flex items-center gap-2 bg-black px-3 py-0.5 ${SUNKEN}`}
      >
        <span aria-hidden="true" className="text-sm text-green-300">Est. Score</span>
        <span aria-hidden="true" className="min-w-[4ch] text-right text-xl font-bold leading-none tabular-nums text-green-400">
          {score}
        </span>
      </span>
      <span role="timer" className={`px-3 py-1 text-sm tabular-nums ${SUNKEN}`}>{time}</span>
    </div>
  );
}