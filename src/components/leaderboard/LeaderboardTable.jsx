import { memo, useState } from 'react';

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '');

const Row = memo(function Row({ entry, rank, isMe, isAdmin, onDelete, onUpdateScore }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(entry.score));
  const [saving, setSaving] = useState(false);

  const handleScoreSubmit = async () => {
    if (saving) return;
    const parsed = parseInt(draft, 10);
    if (isNaN(parsed) || parsed < 0) {
      setDraft(String(entry.score));
      setEditing(false);
      return;
    }
    if (parsed === entry.score) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onUpdateScore(entry._id, parsed);
    setSaving(false);
    setEditing(false);
  };

  return (
    <tr
      className={`border-b border-green-900/40 ${
        isMe ? 'bg-green-500/15 text-green-200' : 'hover:bg-green-500/5'
      }`}
    >
      <td className="px-4 py-2 text-green-500">#{rank}</td>
      <td className="px-4 py-2">
        {entry.username}
        {isMe && <span className="ml-2 text-xs text-green-400">(you)</span>}
      </td>

      <td className="px-4 py-2 text-right tabular-nums">
        {isAdmin && editing ? (
          <input
            type="number"
            min={0}
            step={1}
            value={draft}
            disabled={saving}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleScoreSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleScoreSubmit();
              if (e.key === 'Escape') { setDraft(String(entry.score)); setEditing(false); }
            }}
            className="w-24 rounded border border-green-600 bg-zinc-900 px-2 py-0.5 text-right text-green-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-green-400 disabled:opacity-50"
            aria-label={`Edit score for ${entry.username}`}
          />
        ) : (
          <span
            className={isAdmin ? 'cursor-pointer underline decoration-dotted decoration-green-700 hover:text-green-200' : ''}
            title={isAdmin ? 'Click to edit score' : undefined}
            onClick={isAdmin ? () => { setDraft(String(entry.score)); setEditing(true); } : undefined}
          >
            {saving ? '...' : entry.score.toLocaleString()}
          </span>
        )}
      </td>

      <td className="px-4 py-2 text-green-300/70">{formatDate(entry.createdAt)}</td>
      {isAdmin && (
        <>
          <td className="px-4 py-2 text-xs text-green-300/60">{entry._id}</td>
          <td className="px-4 py-2 text-right">
            <button
              type="button"
              onClick={() => onDelete(entry)}
              className="rounded border border-red-500/60 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              aria-label={`Delete entry for ${entry.username}`}
            >
              delete
            </button>
          </td>
        </>
      )}
    </tr>
  );
});

export default function LeaderboardTable({ entries, currentUserID, isAdmin = false, onDelete, onUpdateScore }) {
  return (
    <div className="overflow-x-auto rounded border border-green-800/60">
      <table className="w-full min-w-120 text-left text-sm">
        <caption className="sr-only">Leaderboard rankings</caption>
        <thead className="bg-green-950/60 text-xs uppercase tracking-wider text-green-500">
          <tr>
            <th scope="col" className="px-4 py-2">Rank</th>
            <th scope="col" className="px-4 py-2">Player</th>
            <th scope="col" className="px-4 py-2 text-right">
              Score
              {isAdmin && <span className="ml-1 font-normal normal-case text-green-700">(click to edit)</span>}
            </th>
            <th scope="col" className="px-4 py-2">Completed</th>
            {isAdmin && (
              <>
                <th scope="col" className="px-4 py-2">Entry ID</th>
                <th scope="col" className="px-4 py-2 text-right">Actions</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <Row
              key={entry._id}
              entry={entry}
              rank={i + 1}
              isMe={!!currentUserID && entry.user === currentUserID}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onUpdateScore={onUpdateScore}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}