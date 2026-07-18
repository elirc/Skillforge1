export function latencyStatusLabels(flags: boolean[]): string[] {
  return flags.map((flag) => (flag ? "yes" : "no"));
}
