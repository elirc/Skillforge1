interface Learner {
  name: string;
  xp: number;
  streak: number;
}

interface LeaderRow {
  rank: number;
  name: string;
  xp: number;
}

export function leaderboard(learners: Learner[]): LeaderRow[] {
  const sorted = [...learners].sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
  return sorted.map((learner, index) => ({ rank: index + 1, name: learner.name, xp: learner.xp }));
}
