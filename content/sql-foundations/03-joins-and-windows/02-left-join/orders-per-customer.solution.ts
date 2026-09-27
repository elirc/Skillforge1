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
  return [...customers]
    .sort((a, b) => a.id - b.id)
    .map((customer) => {
      // The matches for this left row; none still yields one output row.
      const matches = orders.filter((order) => order.customerId !== null && order.customerId === customer.id);
      return {
        id: customer.id,
        name: customer.name,
        orderCount: matches.length,
        totalSpent: matches.reduce((sum, order) => sum + order.total, 0),
      };
    });
}
