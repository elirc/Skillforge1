interface CustomerRow {
  id: number;
  name: string;
}

interface OrderRow {
  id: number;
  customerId: number | null;
  total: number;
}

// SELECT c.name, o.id AS order_id, o.total
// FROM customers c
// INNER JOIN orders o ON o.customer_id = c.id
// ORDER BY o.id
export function innerJoinOrders(customers: CustomerRow[], orders: OrderRow[]) {
  const rows: { name: string; orderId: number; total: number }[] = [];
  // Nested loop join: the simplest physical join a database can choose.
  for (const customer of customers) {
    for (const order of orders) {
      // NULL = c.id is UNKNOWN, so a NULL customerId never matches.
      if (order.customerId !== null && order.customerId === customer.id) {
        rows.push({ name: customer.name, orderId: order.id, total: order.total });
      }
    }
  }
  return rows.sort((a, b) => a.orderId - b.orderId);
}
