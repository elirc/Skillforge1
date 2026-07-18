export function inventoryStatusLabels(flags: boolean[]): string[] {
  return flags.map((flag) => (flag ? "yes" : "no"));
}
