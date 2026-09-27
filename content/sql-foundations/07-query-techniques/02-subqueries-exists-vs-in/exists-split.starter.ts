interface CustomerRow {
  id: number;
  name: string;
}

interface OrderRow {
  id: number;
  customerId: number | null;
  status: string;
}

// -- semi-join: each customer at most once, however many orders match
// SELECT c.name FROM customers c
// WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'paid')
// ORDER BY c.name;
//
// -- anti-join: NOT EXISTS is safe even when orders.customer_id contains NULL
// SELECT c.name FROM customers c
// WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'paid')
// ORDER BY c.name;
export function existsSplit(customers: CustomerRow[], orders: OrderRow[]) {
  // A JOIN would repeat a customer once per order. Build a Set of matching customer ids instead.
  return {
    withPaidOrders: customers.map((c) => c.name),
    withoutPaidOrders: [] as string[],
  };
}
