type Step =
  | { op: "trim" }
  | { op: "nonEmpty" }
  | { op: "toInt" }
  | { op: "range"; min: number; max: number }
  | { op: "lookup"; table: Record<string, unknown> }
  | { op: "default"; value: unknown };

type Result = { ok: true; value: unknown } | { ok: false; error: string };
type PipelineOutput =
  | { ok: true; value: unknown; trace: string[] }
  | { ok: false; error: string; failedAt: number; trace: string[] };

const ok = (value: unknown): Result => ({ ok: true, value });
const fail = (error: string): Result => ({ ok: false, error });

function apply(step: Exclude<Step, { op: "default" }>, value: unknown): Result {
  switch (step.op) {
    case "trim":
      return typeof value === "string" ? ok(value.trim()) : fail("trim: expected a string");
    case "nonEmpty":
      return typeof value === "string" && value.length > 0 ? ok(value) : fail("nonEmpty: value is empty");
    case "toInt":
      return typeof value === "string" && /^-?\d+$/.test(value)
        ? ok(Number(value))
        : fail(`toInt: "${String(value)}" is not an integer`);
    case "range":
      return typeof value === "number" && value >= step.min && value <= step.max
        ? ok(value)
        : fail(`range: ${String(value)} is outside ${step.min}..${step.max}`);
    case "lookup":
      return Object.prototype.hasOwnProperty.call(step.table, String(value))
        ? ok(step.table[String(value)])
        : fail(`lookup: no entry for "${String(value)}"`);
  }
}

export function runPipeline(input: unknown, steps: Step[]): PipelineOutput {
  let current: Result = ok(input);
  let failedAt = -1;
  const trace: string[] = [];

  steps.forEach((step, index) => {
    if (step.op === "default") {
      if (current.ok) {
        trace.push("default:unused");
      } else {
        current = ok(step.value);
        trace.push("default:recovered");
      }
      return;
    }
    if (!current.ok) {
      trace.push(`${step.op}:skipped`);
      return;
    }
    current = apply(step, current.value);
    if (current.ok) {
      trace.push(`${step.op}:ok`);
    } else {
      failedAt = index;
      trace.push(`${step.op}:error`);
    }
  });

  return current.ok
    ? { ok: true, value: current.value, trace }
    : { ok: false, error: current.error, failedAt, trace };
}
