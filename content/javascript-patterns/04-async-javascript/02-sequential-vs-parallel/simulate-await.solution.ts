interface Task {
  ms: number;
  ok: boolean;
  value: string;
}

type Outcome = { status: "fulfilled"; value: string[]; at: number } | { status: "rejected"; reason: string; at: number };

export function simulateAwait(tasks: Task[], mode: "sequential" | "parallel"): Outcome {
  if (mode === "sequential") {
    let elapsed = 0;
    for (const task of tasks) {
      elapsed += task.ms;
      if (!task.ok) return { status: "rejected", reason: task.value, at: elapsed };
    }
    return { status: "fulfilled", value: tasks.map((task) => task.value), at: elapsed };
  }

  // Promise.all: everything starts at 0; the earliest rejection wins.
  let firstFailure: Task | null = null;
  for (const task of tasks) {
    if (!task.ok && (firstFailure === null || task.ms < firstFailure.ms)) firstFailure = task;
  }
  if (firstFailure) return { status: "rejected", reason: firstFailure.value, at: firstFailure.ms };
  const at = tasks.reduce((max, task) => Math.max(max, task.ms), 0);
  return { status: "fulfilled", value: tasks.map((task) => task.value), at };
}
