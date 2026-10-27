import { useEffect, useRef, useState } from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { useItem } from '../../hooks/useItem';
import { useWindows } from '../../hooks/useWindows';
import { DEFAULT_RETRY_SECONDS } from '../../lib/countdown';
import { revealHint, solve } from '../../services/gameService';
import { HINT_COST } from '../../lib/scoreView';
import { LockIcon } from './PixelIcons';
import { RAISED } from './Window95';

function messageFor(err) {
  switch (err?.kind) {
    case 'network':
      return 'Could not reach the server.';
    case 'unauthorized':
      return 'Your session expired. Redirecting to log in...';
    case 'badRequest':
      return 'That answer was not accepted. Check it and try again.';
    case 'conflict':
      return 'The server was busy. Try again.';
    case 'rateLimited':
      return 'Too many attempts. Wait a moment and try again.';
    case 'server':
      return 'Something went wrong on the server. Try again.';
    default:
      return 'Could not check your answer. Try again.';
  }
}

// Same idea for a failed hint request.
function hintMessageFor(err) {
  switch (err?.kind) {
    case 'network':
      return 'Could not reach the server.';
    case 'unauthorized':
      return 'Your session expired. Redirecting to log in...';
    case 'notFound':
    case 'badRequest':
      return 'There is no hint for this lock.';
    case 'conflict':
      return 'The server was busy. Try again.';
    case 'rateLimited':
      return 'Too many requests. Wait a moment and try again.';
    default:
      return 'Could not load the hint. Try again.';
  }
}

const buttonClass = `bg-gray-300 px-3 py-0.5 text-sm text-black ${RAISED} disabled:cursor-not-allowed disabled:text-gray-500`;

/**
 * Shown inside the explorer window in place of the folder contents.
 * target    = the locked child { slug, name, type } that was double-clicked
 * onSolved  = called with the unlocked item returned by the server
 * onCancel  = go back to the folder
 */
export default function LockPrompt({ target, onSolved, onCancel }) {
  const { state, dispatch } = useWindows();
  const { item, loading, error: loadError, waking, refetch } = useItem(target.slug);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState(null);
  const [confirmingHint, setConfirmingHint] = useState(false);
  const [hintBusy, setHintBusy] = useState(false);
  const [hintError, setHintError] = useState('');
  const controllerRef = useRef(null);
  const hintControllerRef = useRef(null);
  // Server said 429: solving and buying hints pause until `waitLeft` reaches 0. Showing an already-paid hint stays free.
  const { left: waitLeft, start: startWait } = useCountdown();
  const waiting = waitLeft > 0;

  useEffect(() => () => {
    controllerRef.current?.abort();
    hintControllerRef.current?.abort();
  }, []);

  const alreadyPaid = state.hintsByLock.includes(target.slug);

  const loadHint = async () => {
    if (waiting) return;
    setConfirmingHint(false);
    setHintError('');
    setHintBusy(true);
    const controller = new AbortController();
    hintControllerRef.current = controller;
    try {
      const result = await revealHint(target.slug, controller.signal);
      if (typeof result?.hint !== 'string') {
        setHintError('Could not load the hint. Try again.');
        return;
      }
      dispatch({ type: 'HINT_REVEALED', slug: target.slug, score: result.score });
      setHintText(result.hint);
      setShowHint(true);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      if (err?.kind === 'rateLimited') {
        startWait(err.retryAfterSeconds ?? DEFAULT_RETRY_SECONDS);
        return;
      }
      setHintError(hintMessageFor(err));
    } finally {
      if (!controller.signal.aborted) setHintBusy(false);
    }
  };

  const handleHintToggle = () => {
    if (hintBusy) return;
    if (showHint) {
      setShowHint(false);
      return;
    }
    if (hintText !== null) {
      setShowHint(true);
      return;
    }
    if (waiting) return;
    if (!alreadyPaid) {
      setConfirmingHint((c) => !c);
      return;
    }
    loadHint();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy || waiting) return;

    const trimmed = answer.trim();
    if (!trimmed) {
      setError('Type an answer first.');
      return;
    }

    setError('');
    setBusy(true);
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const result = await solve(target.slug, trimmed, controller.signal);
      if (result?.correct && result.item) {
        onSolved(result.item, result.score);
        return;
      }
      if (!result?.correct) {
        dispatch({ type: 'WRONG_GUESS', at: Date.now(), score: result?.score });
      }
      setError(result?.correct ? 'Unlocked, but the server sent no item. Try again.' : 'Wrong answer. Try again.');
      setAnswer('');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      if (err?.kind === 'rateLimited') {
        // Blocked before scoring on the server, so it is not a wrong guess. Keep what they typed.
        setError('');
        startWait(err.retryAfterSeconds ?? DEFAULT_RETRY_SECONDS);
        return;
      }
      setError(messageFor(err));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-3"
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return;
        e.stopPropagation();
        if (confirmingHint) setConfirmingHint(false);
        else onCancel();
      }}
    >
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 shrink-0"><LockIcon /></span>
        <h2 className="text-base">{target.name} is locked</h2>
      </div>

      {loading && (
        <p role="status" className="animate-pulse">
          {waking ? 'waking the server...' : 'loading...'}
        </p>
      )}

      {loadError && (
        <div role="alert">
          <p className="text-red-400">Could not load the lock for {target.name}.</p>
          <button type="button" onClick={refetch} className={`mt-2 cursor-pointer ${buttonClass}`}>
            Retry
          </button>
        </div>
      )}

      {item && !item.locked && (
        <div>
          <p>This item is already unlocked.</p>
          <button type="button" onClick={() => onSolved(item)} className={`mt-2 cursor-pointer ${buttonClass}`}>
            Continue
          </button>
        </div>
      )}

      {item?.locked && (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <p className="wrap-break-word text-amber-300">{item.lock?.prompt ?? 'This item is locked.'}</p>

          {item.lock?.hasHint && (
            <div>
              <button
                type="button"
                onClick={handleHintToggle}
                disabled={hintBusy || (waiting && !showHint && hintText === null)}
                aria-expanded={showHint}
                className={`cursor-pointer ${buttonClass}`}
              >
                {hintBusy ? 'Loading hint...' : showHint ? 'Hide hint' : 'Show hint'}
              </button>
              {confirmingHint && (
                <div role="alertdialog" aria-label="Confirm hint" className="mt-2 border-l-4 border-amber-300 bg-amber-300/10 px-2 py-1">
                  <p className="text-amber-200">
                    This hint costs {HINT_COST} points. Showing it again later on this lock is free.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={loadHint} disabled={waiting} autoFocus className={`cursor-pointer ${buttonClass}`}>
                      Reveal hint
                    </button>
                    <button type="button" onClick={() => setConfirmingHint(false)} className={`cursor-pointer ${buttonClass}`}>
                      Not now
                    </button>
                  </div>
                </div>
              )}
              {showHint && hintText !== null && (
                <p className="mt-2 border-l-4 border-green-500 bg-green-500/10 py-1 pl-2 wrap-break-word">
                  {hintText}
                </p>
              )}
              {hintError && (
                <p role="alert" className="mt-2 border-l-4 border-red-400 bg-red-400/10 px-2 py-1 text-red-300">
                  {hintError}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="lock-answer" className="text-sm">Answer</label>
            <input
              id="lock-answer"
              type="text"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setError('');
              }}
              readOnly={busy}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              maxLength={100}
              aria-invalid={!!error}
              aria-describedby={error ? 'lock-error' : undefined}
              className="w-full border-2 border-green-700 bg-black px-2 py-1 text-green-300 caret-green-400 focus:border-green-400 focus:outline-none aria-invalid:border-red-400"
            />
          </div>

          {error && (
            <p id="lock-error" role="alert" className="border-l-4 border-red-400 bg-red-400/10 px-2 py-1 text-red-300">
              {error}
            </p>
          )}

          {waiting && (
            <p role="status" className="border-l-4 border-amber-300 bg-amber-300/10 px-2 py-1 text-amber-200">
              Too many attempts. You can try again in {waitLeft}s. Your answer was not counted.
            </p>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={busy || waiting} className={`cursor-pointer ${buttonClass}`}>
              {busy ? 'Checking...' : waiting ? `Wait ${waitLeft}s` : 'Unlock'}
            </button>
            <button type="button" onClick={onCancel} className={`cursor-pointer ${buttonClass}`}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {(loading || loadError) && (
        <div>
          <button type="button" onClick={onCancel} className={`cursor-pointer ${buttonClass}`}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
