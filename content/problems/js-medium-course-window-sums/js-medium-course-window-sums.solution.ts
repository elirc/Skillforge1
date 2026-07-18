export function courseWindowSums(values: number[], size: number): number[] {
  if (size > values.length) return [];
  const sums: number[] = [];
  let current = 0;
  for (let index = 0; index < values.length; index += 1) {
    current += values[index];
    if (index >= size) current -= values[index - size];
    if (index >= size - 1) sums.push(current);
  }
  return sums;
}
