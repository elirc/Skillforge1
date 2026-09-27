import { NextResponse } from "next/server";
import { compileTypeScript } from "@/lib/sandbox/typescript-compiler";
import { isLocalRequest } from "@/lib/local-request";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!isLocalRequest(request)) return NextResponse.json({ error: "Local same-origin requests only." }, { status: 403 });
  const body = await request.text();
  if (body.length > 256_000) return NextResponse.json({ error: "Submission is too large." }, { status: 413 });
  try {
    const { code } = JSON.parse(body);
    if (typeof code !== "string" || code.length > 50_000) return NextResponse.json({ error: "Invalid source." }, { status: 400 });
    return NextResponse.json(compileTypeScript(code));
  } catch { return NextResponse.json({ error: "Could not compile this submission." }, { status: 400 }); }
}
