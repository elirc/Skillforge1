export function workoutStatusLabels(flags: boolean[]): string[] {
  return flags.map((flag) => (flag ? "yes" : "no"));
}
