type Invoice = { amount: number; paid: boolean };

export function summarizeInvoices(invoices: Invoice[]): { paid: number; unpaid: number } {
  return invoices.reduce(
    (summary, invoice) => {
      if (invoice.paid) summary.paid += invoice.amount;
      else summary.unpaid += invoice.amount;
      return summary;
    },
    { paid: 0, unpaid: 0 },
  );
}
