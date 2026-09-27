import { NextResponse } from "next/server";
import { isLocalRequest } from "@/lib/local-request";

// A real HTTP endpoint over fixed learning fixtures. It never writes learner data.
const products = [{ id: 1, name: "Pen", stock: 4, version: 2 }, { id: 2, name: "Pad", stock: 0, version: 1 }];
const problem = (status: number, title: string, detail: string) => NextResponse.json({ type: "about:blank", status, title, detail }, { status, headers: { "Content-Type": "application/problem+json", "Cache-Control": "no-store" } });
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json(products, { headers: { "Cache-Control": "no-store" } });
  const product = products.find(row => row.id === Number(id));
  return product ? NextResponse.json(product, { headers: { ETag: `"${product.version}"`, "Cache-Control": "no-store" } }) : problem(404, "Product not found", "The fixture contains IDs 1 and 2.");
}
export async function POST(request: Request) {
  if (!isLocalRequest(request)) return problem(403, "Local requests only", "Open this playground from Skillforge.");
  try {
    const text = await request.text();
    if (text.length > 10_000) return problem(413, "Body too large", "Keep this fixture request under 10 KB.");
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) return problem(400, "Invalid product", "Supply a JSON object with name and stock properties.");
    if (typeof body.name !== "string" || !body.name.trim() || !Number.isInteger(body.stock) || body.stock < 0) return problem(400, "Invalid product", "Supply a nonblank name and a nonnegative integer stock.");
    return NextResponse.json({ id: 3, name: body.name.trim(), stock: body.stock, version: 1 }, { status: 201, headers: { Location: "/api/playground/products?id=3", "X-Fixture-Only": "true" } });
  } catch { return problem(400, "Invalid JSON", "Use a JSON object with name and stock properties."); }
}
export async function PATCH(request: Request) {
  if (!isLocalRequest(request)) return problem(403, "Local requests only", "Open this playground from Skillforge.");
  if (request.headers.get("X-Demo-Role") !== "editor") return problem(403, "Editor permission required", "This teaching fixture uses X-Demo-Role; real applications must authenticate and authorize users on the server.");
  if (request.headers.get("If-Match") !== '"2"') return problem(412, "Precondition failed", 'Read the current ETag and send If-Match: "2" to avoid overwriting a newer version.');
  return NextResponse.json({ ...products[0], version: 3 }, { headers: { ETag: '"3"', "X-Fixture-Only": "true" } });
}
