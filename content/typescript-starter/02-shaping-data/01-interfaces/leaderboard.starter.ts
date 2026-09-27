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

// Build a LeaderRow for each learner and annotate the return type as
// LeaderRow[]. TypeScript will then reject a row that misspells a key or
// forgets one.
export function leaderboard(learners: Learner[]) {
  // 1. Sort by xp descending; break ties by name ascending (use localeCompare).
  // 2. Rank starts at 1. Rows keep the key order { rank, name, xp }.
  // 3. Do not mutate the input array.
}
