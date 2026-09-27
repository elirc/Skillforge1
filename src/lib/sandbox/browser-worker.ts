import { buildHarnessSource, sandboxRequestSchema, type SandboxResponse } from "@/lib/sandbox/shared";

// Tells the client the worker module has finished loading, so it can start the
// learner's execution budget from here rather than from `new Worker(...)`.
// Loading this module on a cold page can itself take longer than that budget.
self.postMessage({ ready: true });

self.onmessage = async (event: MessageEvent<unknown>) => {
  try {
    const request = sandboxRequestSchema.parse(event.data);
    // `buildHarnessSource` produces an IIFE *expression*, so it needs an
    // explicit `return` to become the function's value; without one this call
    // evaluated the harness and then returned undefined. The parentheses are
    // load-bearing too: the source starts on a new line, and a bare `return`
    // followed by a newline is terminated by automatic semicolon insertion.
    const response = await new Function(`return (${buildHarnessSource(request)});`)() as SandboxResponse;
    self.postMessage({ ok: true, response });
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
