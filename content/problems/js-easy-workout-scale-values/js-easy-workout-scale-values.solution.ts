export function workoutScaleValues(values: number[], factor: number): number[] {
  return values.map((value) => value * factor);
}
