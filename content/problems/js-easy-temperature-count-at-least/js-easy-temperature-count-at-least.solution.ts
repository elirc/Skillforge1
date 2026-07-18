export function temperatureCountAtLeast(values: number[], minimum: number): number {
  return values.filter((value) => value >= minimum).length;
}
