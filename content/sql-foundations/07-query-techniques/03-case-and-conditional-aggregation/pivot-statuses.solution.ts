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
  const groups = new Map<number, { customerId: number; paidTotal: number; refundedTotal: number; pendingCount: number }>();
  for (const o of orders) {
    let row = groups.get(o.customerId);
    if (!row) {
      row = { customerId: o.customerId, paidTotal: 0, refundedTotal: 0, pendingCount: 0 };
      groups.set(o.customerId, row);
    }
    // Each CASE expression decides which column (if any) this row feeds.
    if (o.status === "paid") row.paidTotal += o.amount;
    else if (o.status === "refunded") row.refundedTotal += o.amount;
    else if (o.status === "pending") row.pendingCount += 1;
  }
  return [...groups.values()].sort((a, b) => a.customerId - b.customerId);
}
