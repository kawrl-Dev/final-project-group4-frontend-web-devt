import { memo, useState } from 'react';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};

const cell = 'px-4 py-2';
const smallText = 'text-[clamp(0.75rem,1.1vw,0.875rem)]';

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
    if (parsed === entry.score || !onUpdateScore) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onUpdateScore(entry._id, parsed);
    setSaving(false);
    setEditing(false);
  };

  return (
    <tr className={`border-b border-brand-forest ${isMe ? 'bg-brand-spring/10 text-white' : 'text-white hover:bg-brand-spring/5'}`}>
      <td className={`${cell} text-brand-spring`}>#{rank}</td>
      <td className={`${cell} break-all`}>
        {entry.username}
        {isMe && <span className={`ml-2 text-brand-spring ${smallText}`}>(you)</span>}
      </td>

      <td className={`${cell} text-right tabular-nums`}>
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
            aria-label={`Edit score for ${entry.username}`}
            className="w-24 border-2 border-brand-forest bg-brand-slate px-2 py-0.5 text-right text-white caret-brand-spring focus:border-brand-spring focus:outline-none disabled:opacity-50"/>
        ) : isAdmin ? (
          <button
            type="button"
            onClick={() => { setDraft(String(entry.score)); setEditing(true); }}
            aria-label={`Edit score for ${entry.username}`}
            title="Click to edit score"
            className="underline decoration-brand-forest decoration-dotted underline-offset-4 hover:text-brand-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {saving ? '...' : entry.score.toLocaleString()}
          </button>
        ) : (
          <span>{entry.score.toLocaleString()}</span>
        )}
      </td>

      <td className={`${cell} text-white/70`}>{formatDate(entry.createdAt)}</td>
      {isAdmin && (
        <>
          <td className={`${cell} break-all text-white/60 ${smallText}`}>{entry._id}</td>
          <td className={`${cell} text-right`}>
            <button
              type="button"
              onClick={() => onDelete?.(entry)}
              className={`border-2 border-red-400 px-2 py-0.5 text-red-300 hover:bg-red-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${smallText}`}
              aria-label={`Delete entry for ${entry.username}`}>
              Delete
            </button>
          </td>
        </>
      )}
    </tr>
  );
});

export default function LeaderboardTable({ entries, currentUserID, isAdmin = false, onDelete, onUpdateScore }) {
  return (
    <table className="w-full min-w-120 text-left text-sm">
      <caption className="sr-only">Leaderboard Rankings</caption>
      <thead className="border-b-2 border-brand-spring font-pixel text-brand-spring">
        <tr>
          <th scope="col" className={`${cell} font-normal`}>Rank</th>
          <th scope="col" className={`${cell} font-normal`}>Player</th>
          <th scope="col" className={`${cell} text-right font-normal`}>Score
            {isAdmin && <span className={`ml-1 text-white/60 ${smallText}`}>(Click to edit)</span>}
          </th>
          <th scope="col" className={`${cell} font-normal`}>Completed</th>
          {isAdmin && (
            <>
              <th scope="col" className={`${cell} font-normal`}>Entry ID</th>
              <th scope="col" className={`${cell} text-right font-normal`}>Actions</th>
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
  );
}