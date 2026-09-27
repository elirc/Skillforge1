type Step = string | [string, string | number];
type Fn = (value: string) => string;
type Result = { ok: true; value: string } | { ok: false; error: string };

const pipe =
  (...fns: Fn[]): Fn =>
  (input) =>
    fns.reduce((value, fn) => fn(value), input);

const simpleSteps: Record<string, Fn> = {
  trim: (s) => s.trim(),
  lower: (s) => s.toLowerCase(),
  upper: (s) => s.toUpperCase(),
  slug: (s) => s.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
};

const configuredSteps: Record<string, (arg: string | number) => Fn> = {
  truncate: (max) => (s) => s.slice(0, Number(max)),
  prefix: (text) => (s) => String(text) + s,
};

function toFn(step: Step): Fn | undefined {
  if (typeof step === "string") {
    return Object.hasOwn(simpleSteps, step) ? simpleSteps[step] : undefined;
  }
  const [name, arg] = step;
  return Object.hasOwn(configuredSteps, name) ? configuredSteps[name](arg) : undefined;
}

export function runPipeline(input: string, steps: Step[]): Result {
  const fns: Fn[] = [];
  for (const step of steps) {
    const fn = toFn(step);
    if (!fn) return { ok: false, error: "unknown step: " + (typeof step === "string" ? step : step[0]) };
    fns.push(fn);
  }
  return { ok: true, value: pipe(...fns)(input) };
}
