export function workoutKeepAtLeast(values: number[], minimum: number): number[] {
  return values.filter((value) => value >= minimum);
}
