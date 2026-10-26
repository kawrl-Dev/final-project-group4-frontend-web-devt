import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useWindows } from '../../hooks/useWindows';
import { activeSeconds, formatTime } from '../../lib/clock';
import { rankFor } from '../../lib/rank';
import { breakdownRows } from '../../lib/scoreView';
import { putSave } from '../../services/saveService';
import { submitScore } from '../../services/leaderboardService';
import Window95, { RAISED } from './Window95';

const PRESS = 'active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white';
const buttonClass = `block w-full bg-gray-300 px-3 py-1 text-center text-black ${RAISED} ${PRESS} enabled:cursor-pointer disabled:cursor-not-allowed disabled:text-gray-500`;

function messageFor(err, fallback) {
  switch (err?.kind) {
    case 'network':
      return 'Could not reach the server.';
    case 'unauthorized':
      return 'Your session expired. Redirecting to log in...';
    case 'forbidden':
      return 'You are not allowed to do that.';
    case 'badRequest':
      return `The server rejected that: ${err.message}`;
    case 'conflict':
      return 'The server was busy. Try again.';
    case 'rateLimited':
      return 'Too many requests. Wait a moment and try again.';
    case 'server':
      return 'Something went wrong on the server (it may be waking up). Try again in a moment.';
    default:
      return fallback;
  }
}

/**
 * Fullscreen overlay shown once the player opens the final file.
 * Rendered by Game.jsx only while state.finished is true.
 *
 * 1. On mount it saves the game once. The server already stamps finishedAt when the last
 *    lock is solved, so this is only a safety net. The save reply is also copied into the
 *    taskbar clock, so the frozen time is the server's.
 * 2. "Submit to Leaderboard" is an explicit click. Everything is computed on the server from
 *    the Save document; nothing score-related is sent. The reply has { run, best, improved },
 *    where run and best are each { score, seconds, breakdown }. The breakdown, the rank title
 *    and the best-score message all come from that reply, so nothing is shown that the
 *    server did not calculate. Before the click we only show what we know: time and locks.
 */
export default function EndScreen() {
  const { state, dispatch } = useWindows();
  const navigate = useNavigate();

  const [snapshot] = useState(() => ({
    solved: state.solved,
    readDocuments: state.readDocuments.map((d) => d.slug),
  }));

  const [phase, setPhase] = useState('saving'); // 'saving' | 'ready' | 'saveError'
  const [attempt, setAttempt] = useState(0); // bumped by Retry to re-run the save
  const [submit, setSubmit] = useState('idle'); // 'idle' | 'submitting' | 'done'
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const submitRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    putSave(snapshot, controller.signal)
      .then((saved) => {
        dispatch({ type: 'SYNC', save: saved });
        setPhase('ready');
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(messageFor(err, 'Could not save your finished game.'));
        setPhase('saveError');
      });
    return () => controller.abort();
  }, [snapshot, attempt, dispatch]);

  useEffect(() => () => submitRef.current?.abort(), []);

  const retrySave = () => {
    setError('');
    setPhase('saving');
    setAttempt((a) => a + 1);
  };

  const handleSubmit = async () => {
    if (submit !== 'idle' || phase !== 'ready') return;
    setError('');
    setSubmit('submitting');
    const controller = new AbortController();
    submitRef.current = controller;
    try {
      const entry = await submitScore(controller.signal);
      setResult(entry);
      setSubmit('done');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setError(messageFor(err, 'Could not submit your score. Try again.'));
      setSubmit('idle');
    }
  };

  const leave = () => navigate('/menu', { replace: true });

  const [now] = useState(() => Date.now());
  const seconds = activeSeconds({
    startedAt: state.startedAt, finishedAt: state.finishedAt, pausedMs: state.pausedMs, now,
  });
  const run = result?.run;
  const rows = breakdownRows(run?.breakdown);
  const bestScore = result?.best?.score ?? result?.score;

  return (
    <div className="absolute inset-0 z-40">
      <div aria-hidden="true" className="absolute inset-0 bg-black/70" />
      <Window95 title="Game Complete" size="h-auto w-[min(28rem,calc(100vw_-_4rem))]" onClose={leave}>
        <div className="flex flex-col gap-3 p-3 text-black">
          <h2 className="text-lg">You found the final file.</h2>

          {phase === 'saving' && (
            <p role="status" className="animate-pulse text-sm">Saving your run...</p>
          )}

          {phase === 'saveError' && (
            <button type="button" onClick={retrySave} className={buttonClass}>
              Retry save
            </button>
          )}

          {submit !== 'done' && phase === 'ready' && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt>Time played</dt>
              <dd className="text-right tabular-nums">{formatTime(seconds)}</dd>
              <dt>Locks solved</dt>
              <dd className="text-right tabular-nums">{state.solved.length}</dd>
            </dl>
          )}

          {submit === 'done' && run && (
            <section aria-label="Score breakdown" className="flex flex-col gap-2">
              <p className="text-base">
                Rank: <strong>{rankFor(run.score)}</strong>
              </p>
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className={row.strong ? 'border-t-2 border-gray-600 font-bold' : ''}>
                      <th scope="row" className="py-0.5 pr-2 text-left font-normal">{row.label}</th>
                      <td className="py-0.5 text-right tabular-nums">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {submit === 'done' && (
            <p role="status" className="border-l-4 border-green-700 bg-green-100 px-2 py-1 text-sm text-green-900">
              {typeof bestScore !== 'number'
                ? 'Submitted!'
                : result.improved === false
                  ? `Your best is still ${bestScore.toLocaleString()}.`
                  : `New best! Your leaderboard score: ${bestScore.toLocaleString()}`}
            </p>
          )}

          {error && (
            <p role="alert" className="border-l-4 border-red-600 bg-red-100 px-2 py-1 text-sm text-red-800">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2">
            {submit !== 'done' ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={phase !== 'ready' || submit === 'submitting'}
                className={buttonClass}
              >
                {submit === 'submitting' ? 'Submitting...' : 'Submit to Leaderboard'}
              </button>
            ) : (
              <Link to="/leaderboard" className={buttonClass}>
                View Leaderboard
              </Link>
            )}
            <button type="button" onClick={leave} disabled={submit === 'submitting'} className={buttonClass}>
              Main Menu
            </button>
          </div>
        </div>
      </Window95>
    </div>
  );
}