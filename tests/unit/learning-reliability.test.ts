import { describe, expect, it } from "vitest";
import { durationMsSchema } from "@/lib/activity-duration";
import { shuffledChoices } from "@/lib/shuffle";
import { runCodeInNodeWorker } from "@/lib/sandbox/node-runner";

describe("reliable learning sessions", () => {
  it("saves long sessions and caps idle time instead of rejecting the answer", () => {
    expect(durationMsSchema.parse(30 * 60_000)).toBe(1_800_000);
    expect(durationMsSchema.parse(10 ** 12)).toBe(86_400_000);
    expect(durationMsSchema.safeParse(-1).success).toBe(false);
  });
  it("preserves options and stable order without always revealing the first answer", () => {
    const choices = ["correct", "wrong one", "wrong two", "wrong three"];
    const positions = new Set<number>();
    for (let i = 0; i < 40; i++) {
      const shuffled = shuffledChoices(choices, `card-${i}`);
      expect(shuffled).toEqual(shuffledChoices(choices, `card-${i}`));
      expect([...shuffled].sort()).toEqual([...choices].sort());
      positions.add(shuffled.indexOf("correct"));
    }
    expect(positions.size).toBeGreaterThan(2);
    expect(choices[0]).toBe("correct");
  });
  it("awaits asynchronous results, compares object keys structurally, and captures output", async () => {
    const result = await runCodeInNodeWorker({ code: 'async function f(n) { console.log("working", n); await Promise.resolve(); return { b: n, a: 1 }; }', functionName: "f", tests: [{ name: "async", args: [2], expected: { a: 1, b: 2 }, hidden: false }] });
    expect(result.passed).toBe(true);
    expect(result.stdout).toContain("working 2");
  });
  it("still terminates an asynchronous submission that never settles", async () => {
    await expect(runCodeInNodeWorker({ code: "async function f() { return new Promise(() => {}); }", functionName: "f", tests: [{ name: "hang", args: [], expected: 1, hidden: false }] }, 100)).rejects.toThrow("timed out");
  });
});
