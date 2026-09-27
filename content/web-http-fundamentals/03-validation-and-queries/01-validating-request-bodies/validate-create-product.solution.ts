interface IncomingRequest {
  contentType: string;
  body: string;
}

type ValidationResult =
  | { status: 415 }
  | { status: 400; title: string; errors?: Record<string, string[]> }
  | { status: 201; product: { name: string; price: number; sku: string } };

export function validateCreateProduct(request: IncomingRequest): ValidationResult {
  const mediaType = request.contentType.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") return { status: 415 };

  let parsed: unknown;
  try {
    parsed = JSON.parse(request.body);
  } catch {
    return { status: 400, title: "Malformed JSON" };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { status: 400, title: "Body must be a JSON object" };
  }

  const body = parsed as Record<string, unknown>;
  const errors: Record<string, string[]> = {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name === "") errors.name = ["Name is required."];
  else if (name.length > 100) errors.name = ["Name must be at most 100 characters."];

  const price = body.price;
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    errors.price = ["Price must be a positive number."];
  }

  const sku = body.sku;
  if (typeof sku !== "string" || !/^[A-Z]{3}-\d{4}$/.test(sku)) {
    errors.sku = ["SKU must look like ABC-1234."];
  }

  if (Object.keys(errors).length > 0) {
    return { status: 400, title: "One or more validation errors occurred.", errors };
  }
  return { status: 201, product: { name, price: price as number, sku: sku as string } };
}
