export function temperatureStatusLabels(flags: boolean[]): string[] {
  return flags.map((flag) => (flag ? "yes" : "no"));
}
