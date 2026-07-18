export function runningTotal(numbers: number[]): number[] {
  const totals: number[] = [];
  let sum = 0;

  for (const number of numbers) {
    sum += number;
    totals.push(sum);
  }

  return totals;
}
