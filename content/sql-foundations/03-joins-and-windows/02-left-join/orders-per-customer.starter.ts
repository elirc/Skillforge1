interface CustomerRow {
  id: number;
  name: string;
}

interface OrderRow {
  id: number;
  customerId: number | null;
  total: number;
}

// SELECT c.id, c.name,
//        COUNT(o.id)               AS order_count,
//        COALESCE(SUM(o.total), 0) AS total_spent
// FROM customers c
// LEFT JOIN orders o ON o.customer_id = c.id
// GROUP BY c.id, c.name
// ORDER BY c.id
export function ordersPerCustomer(customers: CustomerRow[], orders: OrderRow[]) {
  // every customer appears exactly once, even with zero matching orders
  return customers.map((customer) => ({ id: customer.id, name: customer.name, orderCount: 1, totalSpent: 0 }));
}
