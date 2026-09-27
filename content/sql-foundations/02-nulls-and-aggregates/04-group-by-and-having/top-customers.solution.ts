interface OrderRow {
  id: number;
  customerId: number | null;
  status: string | null;
  total: number;
}

interface CustomerSummary {
  customerId: number | null;
  orderCount: number;
  revenue: number;
}

// SELECT customer_id, COUNT(*) AS order_count, SUM(total) AS revenue
// FROM orders
// WHERE status <> 'cancelled'
// GROUP BY customer_id
// HAVING COUNT(*) >= @minOrders
// ORDER BY revenue DESC, customer_id ASC
export function topCustomers(orders: OrderRow[], minOrders: number): CustomerSummary[] {
  // WHERE: NULL <> 'cancelled' is UNKNOWN, so NULL statuses are dropped too.
  const kept = orders.filter((order) => order.status !== null && order.status !== "cancelled");

  // GROUP BY: a Map treats every null key as the same group, like SQL does.
  const groups = new Map<number | null, CustomerSummary>();
  for (const order of kept) {
    const group = groups.get(order.customerId) ?? { customerId: order.customerId, orderCount: 0, revenue: 0 };
    group.orderCount += 1;
    group.revenue += order.total;
    groups.set(order.customerId, group);
  }

  return [...groups.values()]
    .filter((group) => group.orderCount >= minOrders) // HAVING
    .sort((a, b) => b.revenue - a.revenue || (a.customerId ?? -Infinity) - (b.customerId ?? -Infinity));
}
