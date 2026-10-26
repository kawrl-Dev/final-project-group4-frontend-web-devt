import { useEffect, useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useWindows } from '../../hooks/useWindows';
import { activeSeconds, formatTime } from '../../lib/clock';
import { displayScore } from '../../lib/scoreView';
import { RAISED, SUNKEN } from './Window95';

export default function Taskbar() {
  const { state } = useWindows();
  const { showScore } = useSettings();
  const { startedAt, finishedAt, finished, pausedAt, pausedMs, creditLeftMs, score } = state;

  const [now, setNow] = useState(() => Date.now());

  const running = startedAt !== null && finishedAt === null && !finished;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id); // clean up when leaving /game or when the run stops
  }, [running]);

  // Active time only: time spent in the pause menu does not count (up to the server's cap).
  const seconds = activeSeconds({ startedAt, finishedAt, pausedAt, pausedMs, creditLeftMs, now });
  const time = formatTime(seconds);
  const shownScore = displayScore(score);

  return (
    <div className={`absolute inset-x-0 bottom-0 z-30 flex h-10 items-center gap-2 bg-gray-300 px-2 font-pixel text-black ${RAISED}`}>
      <div className="flex-1">
        {state.openWindow && (
          <span className={`inline-block max-w-48 truncate bg-gray-200 px-3 py-1 text-sm font-bold ${SUNKEN}`}>
            {state.openWindow.title}
          </span>
        )}
      </div>
      {showScore && (
        <span
          role="img"
          aria-label={`Score ${shownScore}`}
          title="Your score so far. Your final score is worked out by the server when you finish."
          className={`flex items-center gap-2 bg-black px-3 py-0.5 ${SUNKEN}`}
        >
          <span aria-hidden="true" className="text-sm text-green-300">Score</span>
          <span aria-hidden="true" className="min-w-[4ch] text-right text-xl font-bold leading-none tabular-nums text-green-400">
            {shownScore}
          </span>
        </span>
      )}
      <span role="timer" className={`px-3 py-1 text-sm tabular-nums ${SUNKEN}`}>{time}</span>
    </div>
  );
}
