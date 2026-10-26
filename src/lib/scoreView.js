// How scores are shown. The numbers themselves always come from the server.
import { formatTime } from './clock.js';

// Display text only ("costs 20 points"). The server decides what is actually charged.
export const HINT_COST = 20;

/** The running score can go negative before the first solve; the player only sees 0. */
export function displayScore(score) {
  return Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0;
}

export const formatMultiplier = (m) => `x${Number(m).toFixed(2)}`;

const fmt = (n) => Number(n).toLocaleString('en-US');
const signed = (n, sign) => {
  const v = Math.abs(Number(n) || 0);
  if (v === 0) return '0';
  return `${sign}${fmt(v)}`;
};

/** Turns POST /api/leaderboard `run.breakdown` into rows for the end screen. */
export function breakdownRows(b) {
  if (!b) return [];
  return [
    { key: 'locks', label: `Locks solved (${b.locksSolved})`, value: signed(b.lockPoints, '+') },
    { key: 'hints', label: `Hints used (${b.hintsUsed})`, value: signed(b.hintPenalty, '-') },
    { key: 'wrong', label: `Wrong guesses that cost points (${b.penalizedWrongGuesses})`, value: signed(b.wrongPenalty, '-') },
    { key: 'player', label: 'Puzzle score', value: fmt(b.playerScore) },
    {
      key: 'time',
      label: `Time ${formatTime(b.seconds)} ${formatMultiplier(b.timeMultiplier)}`,
      value: fmt(b.timedScore),
    },
    { key: 'goal', label: 'Final file bonus', value: signed(b.goalBonus, '+') },
    { key: 'final', label: 'Final score', value: fmt(b.finalScore), strong: true },
  ];
}
