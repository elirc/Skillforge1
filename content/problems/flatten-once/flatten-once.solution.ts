export function flattenOnce(rows: number[][]): number[] {
  return rows.reduce<number[]>((flat, row) => flat.concat(row), []);
}
