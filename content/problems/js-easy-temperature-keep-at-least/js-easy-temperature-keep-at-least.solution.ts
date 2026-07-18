export function temperatureKeepAtLeast(values: number[], minimum: number): number[] {
  return values.filter((value) => value >= minimum);
}
