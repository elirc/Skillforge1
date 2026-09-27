type Step =
  | { op: "trim" }
  | { op: "nonEmpty" }
  | { op: "toInt" }
  | { op: "range"; min: number; max: number }
  | { op: "lookup"; table: Record<string, unknown> }
  | { op: "default"; value: unknown };

type Result = { ok: true; value: unknown } | { ok: false; error: string };

export function runPipeline(input: unknown, steps: Step[]) {
  // Thread a Result through the steps, starting from { ok: true, value: input }.
  // While ok: run the step; trace "<op>:ok" or "<op>:error" (remember its index).
  // While failed: "default" recovers with its value ("default:recovered"),
  //   every other step is skipped ("<op>:skipped").
  // A "default" reached while ok does nothing ("default:unused").
  // Return { ok: true, value, trace } or { ok: false, error, failedAt, trace }.
}
