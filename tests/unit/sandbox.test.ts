import { describe, expect, it } from "vitest";
import { runCodeInNodeWorker } from "@/lib/sandbox/node-runner";

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
});
