export function workoutClampAll(values: number[], min: number, max: number): number[] {
  return values.map((value) => Math.min(Math.max(value, min), max));
}
