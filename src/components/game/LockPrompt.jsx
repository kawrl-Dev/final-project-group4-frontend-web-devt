import { useEffect, useRef, useState } from 'react';
import { useItem } from '../../hooks/useItem';
import { solve } from '../../services/gameService';
import { LockIcon } from './PixelIcons';
import { RAISED } from './Window95';

// Turns a failed solve() call into a message the player can act on.
// (401 is already handled by api.js: it clears the token and goes to /login.)
function messageFor(err) {
  switch (err?.kind) {
    case 'network':
      return 'Could not reach the server.';
    case 'unauthorized':
      return 'Your session expired. Redirecting to log in...';
    case 'badRequest':
      return 'That answer was not accepted. Check it and try again.';
    case 'server':
      return 'Something went wrong on the server. Try again.';
    default:
      return 'Could not check your answer. Try again.';
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
  // The folder listing does not include the lock text, so we load the locked
  // item itself. useItem gives us loading / error / retry for free.
  const { item, loading, error: loadError, waking, refetch } = useItem(target.slug);

  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const controllerRef = useRef(null);

  // Leaving the prompt cancels any answer check still in flight.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

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
      // The answer only goes to the server. It is never stored anywhere here.
      const result = await solve(target.slug, trimmed, controller.signal);
      if (result?.correct && result.item) {
        onSolved(result.item);
        return;
      }
      setError(result?.correct ? 'Unlocked, but the server sent no item. Try again.' : 'Wrong answer. Try again.');
      setAnswer('');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setError(messageFor(err));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-3"
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
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

      {/* Safety net: the server says this item is already open. */}
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

          {item.lock?.hint && (
            <div>
              <button
                type="button"
                onClick={() => setShowHint((s) => !s)}
                aria-expanded={showHint}
                className={`cursor-pointer ${buttonClass}`}
              >
                {showHint ? 'Hide hint' : 'Show hint'}
              </button>
              {showHint && (
                <p className="mt-2 border-l-4 border-green-500 bg-green-500/10 py-1 pl-2 wrap-break-word">
                  {item.lock.hint}
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

          <div className="flex gap-2">
            <button type="submit" disabled={busy} className={`cursor-pointer ${buttonClass}`}>
              {busy ? 'Checking...' : 'Unlock'}
            </button>
            <button type="button" onClick={onCancel} className={`cursor-pointer ${buttonClass}`}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* While loading or on a load error there is no form, so keep a way out. */}
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