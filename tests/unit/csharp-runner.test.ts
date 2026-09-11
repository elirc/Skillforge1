import { afterAll, describe, expect, it } from "vitest";
import { CsharpRunnerHost, isCsharpRunnerBuilt } from "../../scripts/lib/csharp-runner";

/**
 * These drive the real .NET host, so they are skipped when it has not been
 * built (`npm run csharp:build`). That keeps `npm test` working for a
 * contributor without the .NET SDK while still covering the runner in CI.
 */
const built = isCsharpRunnerBuilt();
const host = new CsharpRunnerHost();

afterAll(() => host.stop());

describe.skipIf(!built)("csharp runner", () => {
  // The first call pays Roslyn's JIT warm-up, which has been measured at ~22s.
  const timeout = 120_000;

  it(
    "passes a correct solution",
    async () => {
      const response = await host.run(
        "public static class S { public static int Add(int a, int b) => a + b; }",
        "Add",
        [
          { name: "adds", args: [2, 3], expected: 5, hidden: false },
          { name: "handles zero", args: [0, 7], expected: 7, hidden: false },
        ],
      );

      expect(response.passed).toBe(true);
      expect(response.results).toHaveLength(2);
    },
    timeout,
  );

  it(
    "reports a wrong answer with the actual value",
    async () => {
      const response = await host.run(
        "public static class S { public static int Add(int a, int b) => a * b; }",
        "Add",
        [{ name: "adds", args: [2, 3], expected: 5, hidden: false }],
      );

      expect(response.passed).toBe(false);
      expect(response.results[0]).toMatchObject({ passed: false, actual: 6 });
    },
    timeout,
  );

  it(
    "reports compile errors instead of running tests",
    async () => {
      const response = await host.run("public static class S { public static int Add(int a) => a +; }", "Add", [
        { name: "adds", args: [1], expected: 1, hidden: false },
      ]);

      expect(response.passed).toBe(false);
      expect(response.compileErrors?.length).toBeGreaterThan(0);
      expect(response.compileErrors?.[0].line).toBe(1);
    },
    timeout,
  );

  it(
    "surfaces an exception thrown by the submission",
    async () => {
      const response = await host.run(
        'public static class S { public static int Boom(int a) => throw new InvalidOperationException("nope"); }',
        "Boom",
        [{ name: "throws", args: [1], expected: 1, hidden: false }],
      );

      expect(response.results[0].error).toContain("InvalidOperationException");
      expect(response.results[0].error).toContain("nope");
    },
    timeout,
  );

  it(
    "awaits a Task-returning exercise",
    async () => {
      const response = await host.run(
        "public static class S { public static async Task<int> Total(int[] xs) { await Task.Yield(); return xs.Sum(); } }",
        "Total",
        [{ name: "sums", args: [[1, 2, 3]], expected: 6, hidden: false }],
      );

      expect(response.passed).toBe(true);
    },
    timeout,
  );

  it(
    "matches structural values regardless of property order",
    async () => {
      const response = await host.run(
        "public sealed record Point(int X, int Y);\npublic static class S { public static Point Make(int x, int y) => new Point(x, y); }",
        "Make",
        [{ name: "builds a point", args: [1, 2], expected: { Y: 2, X: 1 }, hidden: false }],
      );

      expect(response.passed).toBe(true);
    },
    timeout,
  );

  it(
    "requires exactly one method with the exercise name",
    async () => {
      const response = await host.run(
        "public static class S { public static int Add(int a) => a; public static int Add(int a, int b) => a + b; }",
        "Add",
        [{ name: "adds", args: [1, 2], expected: 3, hidden: false }],
      );

      expect(response.passed).toBe(false);
      expect(response.results[0].error).toContain("define exactly one");
    },
    timeout,
  );

  it(
    "round-trips non-ASCII text",
    async () => {
      // Windows consoles default to a legacy code page; the host forces UTF-8
      // so a learner can use accented text without mystifying failures.
      const response = await host.run(
        "public static class S { public static string Echo(string s) => s + \"!\"; }",
        "Echo",
        [{ name: "keeps accents", args: ["naïve café"], expected: "naïve café!", hidden: false }],
      );

      expect(response.results[0].actual).toBe("naïve café!");
      expect(response.passed).toBe(true);
    },
    timeout,
  );

  it(
    "returns null from a non-generic async Task, not an empty object",
    async () => {
      // `async Task` is a Task<VoidTaskResult> at runtime, so unwrapping by the
      // instance type would surface that private struct as `{}`.
      const response = await host.run(
        "public static class S { public static async Task Nothing(int a) { await Task.Yield(); } }",
        "Nothing",
        [{ name: "returns nothing", args: [1], expected: null, hidden: false }],
      );

      expect(response.passed).toBe(true);
    },
    timeout,
  );

  it(
    "unwraps a ValueTask result",
    async () => {
      const response = await host.run(
        "public static class S { public static ValueTask<int> Twice(int a) => new ValueTask<int>(a * 2); }",
        "Twice",
        [{ name: "doubles", args: [21], expected: 42, hidden: false }],
      );

      expect(response.passed).toBe(true);
    },
    timeout,
  );

  it(
    "keeps learner console output out of the protocol stream",
    async () => {
      const response = await host.run(
        // Builds {"ok":false} without escaping, so the test itself stays legible.
        'public static class S { public static int Chatty(int a) { var q = (char)34; Console.WriteLine("{" + q + "ok" + q + ":false}"); return a; } }',
        "Chatty",
        [{ name: "still parses", args: [7], expected: 7, hidden: false }],
      );

      // A learner printing JSON must not be mistaken for a protocol message.
      expect(response.passed).toBe(true);
    },
    timeout,
  );

  it(
    "gives up on an infinite loop and reports the remaining tests",
    async () => {
      const response = await host.run(
        "public static class S { public static int Spin(int a) { while (true) { } } }",
        "Spin",
        [
          { name: "spins", args: [1], expected: 1, hidden: false },
          { name: "never runs", args: [2], expected: 2, hidden: false },
        ],
      );

      expect(response.timedOut).toBe(true);
      expect(response.results[0].error).toContain("timed out");
      expect(response.results[1].error).toContain("Skipped");
      // The host exits after a timeout, so anything further needs a new one.
      host.stop();
    },
    timeout,
  );
});
