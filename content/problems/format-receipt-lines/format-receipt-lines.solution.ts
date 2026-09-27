type ReceiptItem = { name: string; cents: number };

export function formatReceipt(items: ReceiptItem[], width: number): string[] {
  const formatPrice = (cents: number) => `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;

  const wrap = (text: string) => {
    const lines: string[] = [];
    let line = "";
    for (const word of text.trim().split(/\s+/).filter(Boolean)) {
      let rest = word;
      while (rest.length > width) {
        if (line) {
          lines.push(line);
          line = "";
        }
        lines.push(rest.slice(0, width));
        rest = rest.slice(width);
      }
      if (!line) line = rest;
      else if (line.length + 1 + rest.length <= width) line += ` ${rest}`;
      else {
        lines.push(line);
        line = rest;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const output: string[] = [];
  const placePrice = (lines: string[], price: string) => {
    const last = lines.pop() ?? "";
    output.push(...lines);
    if (last.length + 1 + price.length <= width) {
      output.push(last + " ".repeat(width - last.length - price.length) + price);
    } else {
      output.push(last, price.padStart(width));
    }
  };

  let total = 0;
  for (const item of items) {
    total += item.cents;
    placePrice(wrap(item.name), formatPrice(item.cents));
  }
  output.push("-".repeat(width));
  placePrice(["TOTAL"], formatPrice(total));
  return output;
}
