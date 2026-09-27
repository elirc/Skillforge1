type Op =
  | { op: "add"; sku: string; qty: number }
  | { op: "remove"; sku: string; qty: number }
  | { op: "count"; sku: string };

class Inventory {
  // TODO: make counts private and readonly, and validate every change:
  //   qty must be a positive integer -> Error("qty must be a positive integer")
  //   removing more than is in stock  -> Error("only <n> <sku> in stock")
  // A SKU whose count reaches 0 should be deleted from the map.
  counts = new Map<string, number>();

  add(sku: string, qty: number): number {
    const next = (this.counts.get(sku) ?? 0) + qty;
    this.counts.set(sku, next);
    return next;
  }

  remove(sku: string, qty: number): number {
    const next = (this.counts.get(sku) ?? 0) - qty;
    this.counts.set(sku, next);
    return next;
  }

  count(sku: string): number {
    return this.counts.get(sku) ?? 0;
  }

  skus(): number {
    return this.counts.size;
  }
}

/** Returns each op's resulting count (or error message), then the number of SKUs in stock. */
export function runInventory(ops: Op[]): { results: (number | string)[]; skus: number } {
  const inventory = new Inventory();
  const results = ops.map((op) => {
    if (op.op === "add") return inventory.add(op.sku, op.qty);
    if (op.op === "remove") return inventory.remove(op.sku, op.qty);
    return inventory.count(op.sku);
  });
  return { results, skus: inventory.skus() };
}
