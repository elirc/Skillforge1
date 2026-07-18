export function rollingAverage(values: number[], windowSize: number): number[] {
  if (windowSize > values.length) return [];
  const averages: number[] = [];
  let sum = 0;
  for (let index = 0; index < values.length; index += 1) {
    sum += values[index];
    if (index >= windowSize) sum -= values[index - windowSize];
    if (index >= windowSize - 1) averages.push(sum / windowSize);
  }
  return averages;
}
