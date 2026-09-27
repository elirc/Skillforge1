interface OrderRow {
  id: number;
  customerId: number | null;
  status: string | null;
  total: number;
}

// SELECT customer_id, COUNT(*) AS order_count, SUM(total) AS revenue
// FROM orders
// WHERE status <> 'cancelled'
// GROUP BY customer_id
// HAVING COUNT(*) >= @minOrders
// ORDER BY revenue DESC, customer_id ASC
export function topCustomers(orders: OrderRow[], minOrders: number) {
  // 1. WHERE   2. GROUP BY (a Map keyed by customerId works; null is one key)
  // 3. HAVING  4. ORDER BY
  return [];
}
