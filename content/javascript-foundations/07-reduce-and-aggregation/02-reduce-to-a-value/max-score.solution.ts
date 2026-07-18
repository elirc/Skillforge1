export function maxScore(scores: number[]): number {
  return scores.reduce((max, value) => (value > max ? value : max));
}
