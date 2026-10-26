// Rank title for the end screen. Based on the FINAL score (500 to 2000).
// Cut-offs decided by the team: 1000 / 1400 / 1800.
export const RANKS = [
  { title: 'Intern', min: 0 },
  { title: 'Analyst', min: 1000 },
  { title: 'DBA', min: 1400 },
  { title: 'Minos', min: 1800 },
];

export function rankFor(finalScore) {
  if (!Number.isFinite(finalScore)) return RANKS[0].title;
  let title = RANKS[0].title;
  for (const r of RANKS) if (finalScore >= r.min) title = r.title;
  return title;
}
