import { NextResponse } from "next/server";
import { DotnetUnavailableError, runCsharp } from "@/lib/sandbox/dotnet-host";
import { sandboxRequestSchema } from "@/lib/sandbox/shared";

/**
 * Grades a C# submission.
 *
 * This endpoint executes arbitrary C# as the user running the app. That is the
 * same trust level as the rest of this local-only project -- the learner already
 * runs this repo's code -- but it is worth being blunt about: there is no
 * sandbox boundary here beyond a timeout. The guards below exist to stop a web
 * page the learner happens to be visiting from posting to it, not to contain
 * hostile code. Do not expose this app on a network.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 256 * 1024;
const MAX_CODE_LENGTH = 50_000;
const MAX_TESTS = 50;

/** Only same-machine callers. Defeats a drive-by POST and DNS rebinding. */
function isLocalRequest(request: Request): boolean {
  const host = request.headers.get("host") ?? "";
  const hostname = host.replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
  if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originHost = new URL(origin).hostname.replace(/^\[|\]$/g, "");
    return ["localhost", "127.0.0.1", "::1"].includes(originHost);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isLocalRequest(request)) {
    return NextResponse.json({ ok: false, error: "This endpoint only serves local requests." }, { status: 403 });
  }

  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Submission is too large." }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(body || "{}");
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed submission." }, { status: 400 });
  }

  const parsed = sandboxRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Malformed submission." }, { status: 400 });
  }

  const submission = parsed.data;
  if (submission.code.length > MAX_CODE_LENGTH) {
    return NextResponse.json({ ok: false, error: "Submission is too long." }, { status: 413 });
  }
  if (submission.tests.length > MAX_TESTS) {
    return NextResponse.json({ ok: false, error: "Too many test cases." }, { status: 400 });
  }
  if (!/^[A-Za-z_]\w*$/.test(submission.functionName)) {
    return NextResponse.json({ ok: false, error: "Invalid method name." }, { status: 400 });
  }

  try {
    const response = await runCsharp(submission);

    if (response.compileErrors?.length) {
      return NextResponse.json({ ok: false, kind: "compile", diagnostics: response.compileErrors });
    }

    return NextResponse.json({
      ok: true,
      response: { results: response.results, passed: response.passed },
      stdout: response.stdout ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (error instanceof DotnetUnavailableError) {
      return NextResponse.json({ ok: false, error: message }, { status: 503 });
    }
    if (message.includes("timed out")) {
      return NextResponse.json({ ok: false, error: "Execution timed out." }, { status: 408 });
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
