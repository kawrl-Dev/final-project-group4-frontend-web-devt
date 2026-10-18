import { memo } from 'react';

const Row = memo(function Row({ entry, rank, isMe, isAdmin, onDelete }) {
  return (
    <tr
      className={`border-b border-green-900/40 ${
        isMe ? 'bg-green-500/15 text-green-200' : 'hover:bg-green-500/5'
      }`}
    >
      <td className="px-4 py-2 text-green-500">#{rank}</td>
      <td className="px-4 py-2">
        {entry.player}
        {isMe && <span className="ml-2 text-xs text-green-400">(you)</span>}
      </td>
      <td className="px-4 py-2 text-right tabular-nums">{entry.score.toLocaleString()}</td>
      <td className="px-4 py-2 text-green-300/70">{entry.completedDate}</td>
      {isAdmin && (
        <>
          <td className="px-4 py-2 text-xs text-green-300/60">{entry.entryID}</td>
          <td className="px-4 py-2 text-right">
            <button
              type="button"
              onClick={() => onDelete(entry)}
              className="rounded border border-red-500/60 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              aria-label={`Delete entry for ${entry.player}`}
            >
              delete
            </button>
          </td>
        </>
      )}
    </tr>
  );
});

// Shared table. Admin-only columns appear when isAdmin is true.
export default function LeaderboardTable({ entries, currentUserID, isAdmin = false, onDelete }) {
  return (
    <div className="overflow-x-auto rounded border border-green-800/60">
      <table className="w-full min-w-120 text-left text-sm">
        <caption className="sr-only">Leaderboard rankings</caption>
        <thead className="bg-green-950/60 text-xs uppercase tracking-wider text-green-500">
          <tr>
            <th scope="col" className="px-4 py-2">Rank</th>
            <th scope="col" className="px-4 py-2">Player</th>
            <th scope="col" className="px-4 py-2 text-right">Score</th>
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
              key={entry.entryID}
              entry={entry}
              rank={i + 1}
              isMe={entry.userID === currentUserID}
              isAdmin={isAdmin}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
