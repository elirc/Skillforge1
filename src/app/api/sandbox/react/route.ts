import { NextResponse } from "next/server";
import { isLocalRequest } from "@/lib/local-request";
import { compileReact } from "@/lib/sandbox/react-compiler";
export async function POST(request: Request) {
  if (!isLocalRequest(request)) return NextResponse.json({ error: "Local same-origin requests only." }, { status: 403 });
  const body = await request.text();
  if (body.length > 256_000) return NextResponse.json({ error: "Submission is too large." }, { status: 413 });
  try { const { code } = JSON.parse(body); if (typeof code !== "string" || code.length > 50_000) throw new Error("Invalid source."); return NextResponse.json({ code: compileReact(code) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }); }
}
