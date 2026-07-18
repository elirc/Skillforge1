export function filterPassingScores(scores: number[], passingScore: number): number[] {
  return scores.filter((score) => score >= passingScore);
}
