interface Task {
  ms: number;
  ok: boolean;
  value: string;
}

type Outcome = { status: "fulfilled"; value: string[]; at: number } | { status: "rejected"; reason: string; at: number };

export function simulateAwait(tasks: Task[], mode: "sequential" | "parallel"): Outcome {
  // sequential: `for (const t of tasks) await t` -- times add up, and the
  //   first failing task (in order) stops the loop.
  // parallel: `await Promise.all(tasks)` -- all start at 0, it settles at the
  //   slowest task, or rejects at the earliest-failing task.
  return { status: "fulfilled", value: [], at: 0 };
}
