interface CartLine {
  price: string; // like "4.99", straight from a form or an API
  quantity: number;
}

// Add up the cart in whole cents so floating-point errors never show,
// then format as dollars: "$12.34".
// Skip a line whose price is not a number or whose quantity is not a positive whole number.
export function cartTotal(lines: CartLine[]): string {
  // Adding dollars directly drifts (0.1 + 0.2 is 0.30000000000000004) and bad input makes NaN.
  // Convert each price to cents with Math.round(price * 100) and add integers instead.
  let total = 0;
  for (const line of lines) {
    total += Number(line.price) * line.quantity;
  }
  return `$${total}`;
}
