type Step = string | [string, string | number];
type Fn = (value: string) => string;
type Result = { ok: true; value: string } | { ok: false; error: string };

// BUG: this applies the functions right to left (that is compose, not pipe).
const pipe =
  (...fns: Fn[]): Fn =>
  (input) =>
    fns.reduceRight((value, fn) => fn(value), input);

// Steps without an argument: trim, lower, upper, slug.
// Steps with an argument: ["truncate", n], ["prefix", text].
// TODO: add upper, truncate, and prefix, and return
// { ok: false, error: "unknown step: <name>" } for anything else.
const simpleSteps: Record<string, Fn> = {
  trim: (s) => s.trim(),
  lower: (s) => s.toLowerCase(),
  slug: (s) => s.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
};

export function runPipeline(input: string, steps: Step[]): Result {
  const fns = steps.map((step) => simpleSteps[typeof step === "string" ? step : step[0]]);
  return { ok: true, value: pipe(...fns)(input) };
}
