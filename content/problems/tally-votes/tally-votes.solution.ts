export function tallyVotes(votes: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const vote of votes) {
    counts[vote] = (counts[vote] ?? 0) + 1;
  }
  return counts;
}
