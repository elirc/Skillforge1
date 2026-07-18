export function rotateArray(values: number[], k: number): number[] {
  if (values.length === 0) return [];
  const steps = k % values.length;
  if (steps === 0) return [...values];
  return [...values.slice(-steps), ...values.slice(0, -steps)];
}
