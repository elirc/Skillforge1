interface PaymentRow {
  id: number;
  customerId: number | null;
  amount: number | null;
}

// SELECT COUNT(*), COUNT(amount), COUNT(DISTINCT customer_id),
//        SUM(amount), AVG(amount), MIN(amount), MAX(amount)
// FROM payments
export function summarizePayments(rows: PaymentRow[]) {
  // Aggregates other than COUNT(*) only see non-NULL values.
  const amounts = rows.map((row) => row.amount).filter((amount): amount is number => amount !== null);
  const customers = new Set(rows.map((row) => row.customerId).filter((id) => id !== null));
  const sum = amounts.reduce((total, amount) => total + amount, 0);
  const hasValues = amounts.length > 0;

  return {
    countStar: rows.length,
    countAmount: amounts.length,
    distinctCustomers: customers.size,
    sumAmount: hasValues ? sum : null,
    avgAmount: hasValues ? sum / amounts.length : null,
    minAmount: hasValues ? Math.min(...amounts) : null,
    maxAmount: hasValues ? Math.max(...amounts) : null,
  };
}
