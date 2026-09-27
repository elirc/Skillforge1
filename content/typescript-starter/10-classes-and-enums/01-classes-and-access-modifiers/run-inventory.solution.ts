type Op =
  | { op: "add"; sku: string; qty: number }
  | { op: "remove"; sku: string; qty: number }
  | { op: "count"; sku: string };

class Inventory {
  private readonly counts = new Map<string, number>();

  add(sku: string, qty: number): number {
    this.assertQty(qty);
    const next = this.count(sku) + qty;
    this.counts.set(sku, next);
    return next;
  }

  remove(sku: string, qty: number): number {
    this.assertQty(qty);
    const current = this.count(sku);
    if (qty > current) throw new Error("only " + current + " " + sku + " in stock");
    const next = current - qty;
    if (next === 0) this.counts.delete(sku);
    else this.counts.set(sku, next);
    return next;
  }

  count(sku: string): number {
    return this.counts.get(sku) ?? 0;
  }

  skus(): number {
    return this.counts.size;
  }

  private assertQty(qty: number): void {
    if (!Number.isInteger(qty) || qty <= 0) throw new Error("qty must be a positive integer");
  }
}

/** Returns each op's resulting count (or error message), then the number of SKUs in stock. */
export function runInventory(ops: Op[]): { results: (number | string)[]; skus: number } {
  const inventory = new Inventory();
  const results = ops.map((op) => {
    try {
      if (op.op === "add") return inventory.add(op.sku, op.qty);
      if (op.op === "remove") return inventory.remove(op.sku, op.qty);
      return inventory.count(op.sku);
    } catch (error) {
      return (error as Error).message;
    }
  });
  return { results, skus: inventory.skus() };
}
