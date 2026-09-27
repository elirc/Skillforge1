import { describe, expect, it } from "vitest";
import { runCodeInNodeWorker } from "@/lib/sandbox/node-runner";
import { buildHarnessSource, type SandboxResponse } from "@/lib/sandbox/shared";

describe("code sandbox", () => {
  it("runs visible tests and returns structured results", async () => {
    const result = await runCodeInNodeWorker({
      code: "function double(value) { return value * 2; }",
      functionName: "double",
      tests: [{ name: "double four", args: [4], expected: 8, hidden: false }],
    });

    expect(result.passed).toBe(true);
    expect(result.results[0]).toMatchObject({ name: "double four", passed: true, actual: 8 });
  });

  it("kills an infinite loop without hanging the app", async () => {
    await expect(
      runCodeInNodeWorker(
        {
          code: "function spin() { while (true) {} }",
          functionName: "spin",
          tests: [{ name: "timeout", args: [], expected: true, hidden: false }],
        },
        100,
      ),
    ).rejects.toThrow("Execution timed out");
  });

  // `buildHarnessSource` returns an IIFE *expression*. The browser worker
  // evaluates it with `new Function`, which needs an explicit `return` and the
  // wrapping parentheses -- without the return it silently produced `undefined`
  // (the Run button reported "Cannot read properties of undefined (reading
  // 'passed')"), and without the parentheses ASI turns it into a bare `return`.
  it("evaluates the harness the way the browser worker does", async () => {
    const source = buildHarnessSource({
      code: "function double(value) { return value * 2; }",
      functionName: "double",
      tests: [
        { name: "doubles four", args: [4], expected: 8, hidden: false },
        { name: "doubles zero", args: [0], expected: 0, hidden: false },
      ],
    });

    const response = await new Function(`return (${source});`)() as SandboxResponse;

    expect(response).toBeDefined();
    expect(response.passed).toBe(true);
    expect(response.results).toHaveLength(2);
  });

  it("reports a failing test through the browser harness", async () => {
    const source = buildHarnessSource({
      code: "function double(value) { return value * 3; }",
      functionName: "double",
      tests: [{ name: "doubles four", args: [4], expected: 8, hidden: false }],
    });

    const response = await new Function(`return (${source});`)() as SandboxResponse;

    expect(response.passed).toBe(false);
    expect(response.results[0]).toMatchObject({ passed: false, actual: 12 });
  });
});
