interface OrderRow {
  id: number;
  customerId: number | null;
}

// SELECT id FROM orders
// WHERE customer_id NOT IN (SELECT customer_id FROM blocked)
//
// x NOT IN (a, b, c)  means  x <> a AND x <> b AND x <> c
// A comparison with NULL on either side is UNKNOWN (use null for UNKNOWN).
// WHERE keeps the row only when the whole predicate is TRUE.
export function whereNotIn(orders: OrderRow[], blocked: (number | null)[]) {
  return orders.filter((order) => !blocked.includes(order.customerId)).map((order) => order.id);
}
