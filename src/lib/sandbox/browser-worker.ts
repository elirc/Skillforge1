import { buildHarnessSource, sandboxRequestSchema, type SandboxResponse } from "@/lib/sandbox/shared";

self.onmessage = (event: MessageEvent<unknown>) => {
  try {
    const request = sandboxRequestSchema.parse(event.data);
    const response = new Function(buildHarnessSource(request))() as SandboxResponse;
    self.postMessage({ ok: true, response });
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
