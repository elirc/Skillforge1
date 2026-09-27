import type { TestCase } from "@content/_authoring/types";

export const functionName = "debounceFires";

export const tests: TestCase[] = [
  { name: "a burst fires once after the last event", args: [[0, 100, 200], 300], expected: [500] },
  { name: "two separate bursts fire twice", args: [[0, 100, 200, 1000, 1050], 300], expected: [500, 1350] },
  { name: "a single event fires after the wait", args: [[0], 50], expected: [50] },
  { name: "events exactly `wait` apart each fire", args: [[0, 300, 600], 300], expected: [300, 600, 900], hidden: true },
  { name: "no events, no fires", args: [[], 100], expected: [], hidden: true },
];
