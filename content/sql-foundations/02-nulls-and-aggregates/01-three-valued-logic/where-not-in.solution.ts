interface OrderRow {
  id: number;
  customerId: number | null;
}

/** SQL `<>`: TRUE, FALSE, or UNKNOWN (null) when either side is NULL. */
function notEqual(a: number | null, b: number | null): boolean | null {
  if (a === null || b === null) return null;
  return a !== b;
}

// SELECT id FROM orders
// WHERE customer_id NOT IN (SELECT customer_id FROM blocked)
export function whereNotIn(orders: OrderRow[], blocked: (number | null)[]): number[] {
  return orders
    .filter((order) => {
      // Three-valued AND over every comparison, starting from TRUE (empty list).
      let result: boolean | null = true;
      for (const value of blocked) {
        const comparison = notEqual(order.customerId, value);
        if (comparison === false) return false; // FALSE AND anything = FALSE
        if (comparison === null) result = null; // TRUE AND UNKNOWN = UNKNOWN
      }
      return result === true;
    })
    .map((order) => order.id);
}
