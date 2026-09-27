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
  // keep only (customer, order) pairs where the ON condition is TRUE
  return orders.map((order) => ({ name: "", orderId: order.id, total: order.total }));
}
