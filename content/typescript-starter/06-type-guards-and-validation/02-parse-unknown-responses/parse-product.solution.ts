type Product = { id: number; title: string; priceCents: number; tags: string[] };
type ParseResult = { ok: true; product: Product } | { ok: false; error: string };

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseProduct(body: unknown): ParseResult {
  try {
    check(isRecord(body), "body is not an object");
    const { id, title, price, tags } = body;
    check(typeof id === "number" && Number.isInteger(id) && id > 0, "id must be a positive integer");
    check(typeof title === "string" && title.trim() !== "", "title is required");
    check(typeof price === "number" && Number.isFinite(price) && price >= 0, "price must be a non-negative number");
    check(
      tags === undefined || (Array.isArray(tags) && tags.every((tag) => typeof tag === "string")),
      "tags must be an array of strings",
    );
    return {
      ok: true,
      product: {
        id,
        title: title.trim(),
        priceCents: Math.round(price * 100),
        tags: (tags as string[] | undefined) ?? [],
      },
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
