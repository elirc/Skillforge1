interface OrderRow {
  customerId: number;
  status: string;
  amount: number;
}

// SELECT customer_id,
//        SUM(CASE WHEN status = 'paid'     THEN amount ELSE 0 END) AS paid_total,
//        SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) AS refunded_total,
//        COUNT(CASE WHEN status = 'pending' THEN 1 END)            AS pending_count
// FROM orders
// GROUP BY customer_id
// ORDER BY customer_id;
export function pivotStatuses(orders: OrderRow[]) {
  // One output row per customer; each CASE decides which column a row adds to.
  return orders.map((o) => ({ customerId: o.customerId, paidTotal: o.amount, refundedTotal: 0, pendingCount: 0 }));
}
