export type Addon = { id: string; price: number; value: number };
type Cell = { value: number; price: number };

const better = (a: Cell, b: Cell) => a.value > b.value || (a.value === b.value && a.price < b.price);

export function bestBundle(addons: Addon[], budget: number): { value: number; price: number; ids: string[] } {
  const n = addons.length;
  const best: Cell[][] = [Array.from({ length: budget + 1 }, () => ({ value: 0, price: 0 }))];
  const took: boolean[][] = [new Array<boolean>(budget + 1).fill(false)];

  for (let i = 1; i <= n; i++) {
    const { price, value } = addons[i - 1];
    const row: Cell[] = [];
    const takeRow: boolean[] = [];
    for (let c = 0; c <= budget; c++) {
      const skip = best[i - 1][c];
      const take = price <= c ? { value: best[i - 1][c - price].value + value, price: best[i - 1][c - price].price + price } : null;
      const useTake = take !== null && better(take, skip);
      row.push(useTake ? take : skip);
      takeRow.push(useTake);
    }
    best.push(row);
    took.push(takeRow);
  }

  const ids: string[] = [];
  let c = budget;
  for (let i = n; i >= 1; i--) {
    if (took[i][c]) {
      ids.push(addons[i - 1].id);
      c -= addons[i - 1].price;
    }
  }
  const result = best[n][budget];
  return { value: result.value, price: result.price, ids: ids.sort() };
}
