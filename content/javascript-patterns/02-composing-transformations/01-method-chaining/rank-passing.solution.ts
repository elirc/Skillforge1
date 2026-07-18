export function rankPassing(scores: number[]): number[] {
  return scores.filter((score) => score >= 80).sort((a, b) => b - a);
}
