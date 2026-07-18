export function groupByParity(numbers: number[]): { even: number[]; odd: number[] } {
  const groups: { even: number[]; odd: number[] } = { even: [], odd: [] };
  for (const value of numbers) {
    if (value % 2 === 0) groups.even.push(value);
    else groups.odd.push(value);
  }
  return groups;
}
