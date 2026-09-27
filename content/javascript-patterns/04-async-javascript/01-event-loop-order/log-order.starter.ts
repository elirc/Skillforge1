interface Step {
  kind: "sync" | "microtask" | "macrotask";
  label: string;
}

export function logOrder(steps: Step[]): string[] {
  // Right now this logs in source order. Instead: all synchronous logs first,
  // then every microtask (promise callbacks), then every macrotask (timers),
  // keeping source order within each group.
  return steps.map((step) => step.label);
}
