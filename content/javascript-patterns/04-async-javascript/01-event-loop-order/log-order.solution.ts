interface Step {
  kind: "sync" | "microtask" | "macrotask";
  label: string;
}

export function logOrder(steps: Step[]): string[] {
  const labelsOf = (kind: Step["kind"]) => steps.filter((step) => step.kind === kind).map((step) => step.label);
  return [...labelsOf("sync"), ...labelsOf("microtask"), ...labelsOf("macrotask")];
}
