export function passingReadonly(scores: ReadonlyArray<number>): number[] {
  return scores.filter((score) => score >= 70);
}
