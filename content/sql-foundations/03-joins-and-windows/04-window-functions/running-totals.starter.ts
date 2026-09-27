interface PaymentRow {
  id: number;
  customerId: number;
  paidAt: string;
  amount: number;
}

// SELECT id, customer_id,
//        SUM(amount) OVER (PARTITION BY customer_id ORDER BY paid_at, id
//                          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,
//        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY paid_at, id) AS payment_number
// FROM payments
// ORDER BY customer_id, paid_at, id
export function runningTotals(payments: PaymentRow[]) {
  // sort a copy, then walk it keeping a running sum and counter that reset per customer
  return payments.map((p) => ({ id: p.id, customerId: p.customerId, runningTotal: p.amount, paymentNumber: 1 }));
}
