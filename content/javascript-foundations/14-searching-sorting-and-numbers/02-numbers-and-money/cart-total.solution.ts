interface CartLine {
  price: string; // like "4.99", straight from a form or an API
  quantity: number;
}

// Add up the cart in whole cents so floating-point errors never show,
// then format as dollars: "$12.34".
// Skip a line whose price is not a number or whose quantity is not a positive whole number.
export function cartTotal(lines: CartLine[]): string {
  let totalCents = 0;
  for (const line of lines) {
    const price = Number(line.price);
    if (line.price.trim() === "" || Number.isNaN(price)) continue;
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) continue;

    const cents = Math.round(price * 100); // "4.99" -> 499
    totalCents += cents * line.quantity;
  }

  const dollars = Math.floor(totalCents / 100);
  const cents = String(totalCents % 100).padStart(2, "0");
  return `$${dollars}.${cents}`;
}
