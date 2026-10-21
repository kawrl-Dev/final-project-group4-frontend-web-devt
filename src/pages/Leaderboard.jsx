import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { MOCK_USERS } from '../context/AuthContext';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import ConfirmModal from '../components/leaderboard/ConfirmModal';

function messageFor(err, fallback) {
  switch (err?.kind) {
    case 'network':
      return 'Could not reach the server.';
    case 'unauthorized':
      return 'Your session expired. Redirecting to log in...';
    case 'forbidden':
      return 'You are not allowed to do that.';
    case 'notFound':
      return 'That entry no longer exists. Refresh the list.';
    case 'badRequest':
      return `The server rejected that: ${err.message}`;
    case 'server':
      return 'Something went wrong on the server (it may be waking up). Try again in a moment.';
    default:
      return fallback;
  }
}

export default function Leaderboard() {
  const { user, setUser, isAdmin, loading: authLoading } = useAuth();
  const { entries, loading, error, waking, refetch, removeEntry, updateScore } = useLeaderboard({
    all: isAdmin,
    enabled: !authLoading,
  });
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleConfirm = async () => {
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
    setActionError(null);
    try {
      await updateScore(id, score);
    } catch (err) {
      setActionError(messageFor(err, 'Could not update that score. Try again.'));
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 font-mono text-green-300">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-green-600">db.leaderboard.find()</p>
            <h1 className="text-2xl text-green-400">
              {isAdmin ? 'Leaderboard // Admin' : 'Leaderboard // Top 10'}
            </h1>
          </div>
          <Link
            to="/menu"
            className="rounded border border-green-700 px-3 py-1.5 text-sm hover:bg-green-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
          >
            &larr; back
          </Link>
        </header>

        {actionError && (
          <p role="alert" className="mb-4 rounded border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-300">
            {actionError}
          </p>
        )}

        {loading && (
          <p role="status" className="animate-pulse py-10 text-center text-green-500">
            {waking ? 'waking the server...' : 'loading entries...'}
          </p>
        )}

        {!loading && error && (
          <div role="alert" className="rounded border border-red-500/60 bg-red-500/10 p-6 text-center">
            <p className="mb-3 text-red-300">{messageFor(error, 'Could not load the leaderboard.')}</p>
            <button
              type="button"
              onClick={refetch}
              className="rounded border border-green-700 px-3 py-1.5 text-sm hover:bg-green-500/10"
            >
              try again
            </button>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="rounded border border-green-800/60 py-10 text-center text-green-500">
            No scores yet. Be the first to reach the final file.
          </p>
        )}

        {!loading && !error && entries.length > 0 && (
          <LeaderboardTable
            entries={entries}
            currentUserID={user?.id}
            isAdmin={isAdmin}
            onDelete={setPending}
            onUpdateScore={handleUpdateScore}
          />
        )}

        {/* DEV ONLY */}
        {import.meta.env.DEV && (
          <div className="mt-8 flex items-center gap-2 border-t border-green-900/50 pt-4 text-xs text-green-600">
            <span>dev: viewing as</span>
            {Object.entries(MOCK_USERS).map(([key, u]) => (
              <button
                key={key}
                type="button"
                onClick={() => setUser(u)}
                aria-pressed={user?.role === u.role}
                className={`rounded border px-2 py-1 ${
                  user?.role === u.role ? 'border-green-400 text-green-300' : 'border-green-900 hover:border-green-700'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        )}
      </div>

      {pending && (
        <ConfirmModal
          title="Delete entry?"
          message={`Remove ${pending.username}'s score of ${pending.score.toLocaleString()} from the leaderboard? This cannot be undone.`}
          confirmLabel="delete"
          busy={deleting}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </main>
  );
}