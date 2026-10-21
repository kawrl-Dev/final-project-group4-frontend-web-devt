import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useLeaderboard } from '../hooks/useLeaderboard';
import LeaderboardTable from '../components/LeaderboardTable';
import FloatingBinary from '../components/FloatingBinary'
import Spinner from '../components/Spinner';
import bg from '../assets/home-page.png';

const glow = {textShadow: '0 0 0.5em #00ED64, 0 0 0.2em #00ED64, 0 0 0.2em #00ED64, 0 0 0.45em #00684A',};
const buttonClass = 'border-2 border-brand-spring bg-brand-spring px-4 py-[0.5em] text-brand-slate text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-transparent hover:text-brand-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50';
const outlineClass = 'border-2 border-brand-spring px-4 py-[0.5em] text-brand-spring text-[clamp(1rem,1.8vw,1.25rem)] hover:bg-brand-spring hover:text-brand-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50';
const alertClass = 'border-l-4 border-red-400 bg-red-400/10 px-4 py-3 text-red-300 text-[clamp(0.875rem,1.3vw,1rem)]';

function messageFor(err, fallback) {
  switch (err?.kind) {
    case 'network':
      return 'Could not reach the server.';
    case 'unauthorized':
      return 'Your session expired. Please log in again.';
    case 'forbidden':
      return 'You are not allowed to do that.';
    case 'notFound':
      return 'That entry no longer exists. Refresh the list.';
    case 'badRequest':
      return `That request was not accepted.`;
    case 'server':
      return 'Something went wrong on the server (it may be waking up). Try again in a moment.';
    default:
      return fallback;
  }
}

export default function Leaderboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { entries, loading, error, waking, refetch, removeEntry, updateScore } = useLeaderboard({
    all: isAdmin,
    enabled: !authLoading,
  });
  const dialogRef = useRef(null);
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (pending && !d.open) d.showModal();
    if (!pending && d.open) d.close();
  }, [pending]);

  const handleConfirm = async () => {
    if (!isAdmin || !pending) return;
    setDeleting(true);
    setActionError(null);
    try {
      await removeEntry(pending._id);
    } catch (err) {
      setActionError(messageFor(err, 'Could not delete that entry. Try again.'));
    } finally {
      setPending(null);
      setDeleting(false);
    }
  };

  const handleUpdateScore = async (id, score) => {
    if (!isAdmin) return;
    setActionError(null);
    try {
      await updateScore(id, score);
    } catch (err) {
      setActionError(messageFor(err, 'Could not update that score. Try again.'));
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center p-6" style={{ backgroundImage: `url(${bg})` }}>
      <FloatingBinary />
      <div aria-hidden="true" className="pointer-events-none absolute inset-6 border-2 border-brand-spring/45 shadow-[inset_0_0_24px_#00ED64]"/>
        <section aria-labelledby="leaderboard" className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col gap-[clamp(0.75rem,2vh,1.25rem)] overflow-y-auto border-2 border-brand-spring bg-brand-evergreen p-[clamp(1.25rem,3vw,2.5rem)] shadow-[8px_8px_0_0_#00684A]">
          <div>
            <h1 id="leaderboard" className="font-pixel font-normal leading-[1.1] text-white text-[clamp(2rem,4.5vw,3.5rem)]" style={glow}>
              Leaderboard
            </h1>
            <p className="mt-1 text-white/70 text-[clamp(0.875rem,1.3vw,1rem)]">
              {isAdmin ? 'Admin View' : 'Top 10'}
            </p>
          </div>

          {actionError && (
            <p role="alert" className={alertClass}>
              {actionError}
            </p>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Spinner />
              {waking && (
                <p className="text-white/70 text-[clamp(0.875rem,1.3vw,1rem)]">
                  Please wait a moment.
                </p>
              )}
            </div>
          )}

          {!loading && error && (
            <div role="alert" className="flex flex-col gap-3">
              <p className={alertClass}>{messageFor(error, 'Could not load the leaderboard.')}</p>
              <button type="button" onClick={refetch} className={buttonClass}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <p className="text-white/80 text-[clamp(1rem,1.6vw,1.25rem)]">
              No scores yet. Be the first.
            </p>
          )}

          {!loading && !error && entries.length > 0 && (
            <div className="overflow-x-auto">
              <LeaderboardTable
                entries={entries}
                currentUserID={user?.id}
                isAdmin={isAdmin}
                onDelete={isAdmin ? setPending : undefined}
                onUpdateScore={isAdmin ? handleUpdateScore : undefined}/>
            </div>
          )}

          <Link
            to="/menu"
            className="pt-2 text-center text-white/70 text-[clamp(1rem,1.8vw,1.25rem)] hover:text-white focus-visible:text-white focus-visible:outline-none">
              Back to Menu
          </Link>
        </section>

        {isAdmin && (
          <dialog
            ref={dialogRef}
            onClose={() => setPending(null)}
            aria-labelledby="delete-entry-title"
            className="m-auto w-[min(90vw,28rem)] border-2 border-brand-spring bg-brand-evergreen p-[clamp(1.25rem,3vw,2rem)] text-white shadow-[8px_8px_0_0_#00684A] backdrop:bg-black/70">
            <h2 id="delete-entry-title" className="font-pixel font-normal text-white text-[clamp(1.5rem,3vw,2rem)]">
              Delete entry?
            </h2>
            <p className="mt-2 break-words text-white/80 text-[clamp(0.875rem,1.3vw,1rem)]">
              {pending ? `Remove ${pending.username}'s score of ${pending.score.toLocaleString()} from the leaderboard? This cannot be undone.` : ''}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button type="button" onClick={() => dialogRef.current?.close()} className={outlineClass}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirm} disabled={deleting} className={buttonClass}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </dialog>
        )}
      </main>
  );
}