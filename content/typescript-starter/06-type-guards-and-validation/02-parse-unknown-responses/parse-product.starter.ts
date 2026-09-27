type Product = { id: number; title: string; priceCents: number; tags: string[] };
type ParseResult = { ok: true; product: Product } | { ok: false; error: string };

// An assertion function: if it returns at all, `condition` was truthy, and
// TypeScript narrows accordingly after the call. It throws otherwise.
function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// Parse an API body typed as unknown into a ParseResult. Check fields in this
// order and report only the first problem:
//   body is a non-null, non-array object   else "body is not an object"
//   id is a positive integer               else "id must be a positive integer"
//   title is a string, non-empty trimmed   else "title is required"
//   price is a number >= 0 (dollars)       else "price must be a non-negative number"
//   tags is missing, or an array of strings else "tags must be an array of strings"
// On success return { ok: true, product: { id, title (trimmed),
// priceCents: Math.round(price * 100), tags (or [] when missing) } }.
// Tip: call check(...) inside try/catch and turn the thrown message into { ok: false, error }.
export function parseProduct(body: unknown) {
}
