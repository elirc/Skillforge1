export function passingScores(scores: number[]): number[] {
  return scores.filter((score) => score >= 80);
}
