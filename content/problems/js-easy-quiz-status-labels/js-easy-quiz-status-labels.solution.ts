export function quizStatusLabels(flags: boolean[]): string[] {
  return flags.map((flag) => (flag ? "yes" : "no"));
}
