import type { TestCase } from "@content/_authoring/types";

export const functionName = "schedule";

const job = (id: string, arrival: number, duration: number, priority: number) => ({ id, arrival, duration, priority });
const slot = (id: string, worker: number, start: number, end: number) => ({ id, worker, start, end });

export const tests: TestCase[] = [
  {
    name: "one worker picks the highest priority waiting job",
    args: [[job("a", 0, 3, 1), job("b", 1, 2, 5), job("c", 2, 1, 1)], 1],
    expected: [slot("a", 0, 0, 3), slot("b", 0, 3, 5), slot("c", 0, 5, 6)],
  },
  {
    name: "two workers share the queue",
    args: [[job("a", 0, 4, 1), job("b", 0, 2, 1), job("c", 1, 3, 9), job("d", 2, 1, 1)], 2],
    expected: [slot("a", 0, 0, 4), slot("b", 1, 0, 2), slot("c", 1, 2, 5), slot("d", 0, 4, 5)],
  },
  {
    name: "idle time is skipped",
    args: [[job("a", 0, 1, 1), job("b", 5, 1, 1)], 1],
    expected: [slot("a", 0, 0, 1), slot("b", 0, 5, 6)],
  },
  {
    name: "equal priority and arrival fall back to id",
    args: [[job("b", 0, 1, 3), job("a", 0, 1, 3)], 1],
    expected: [slot("a", 0, 0, 1), slot("b", 0, 1, 2)],
  },
  {
    name: "equal priority prefers the earlier arrival over the id",
    args: [[job("busy", 0, 3, 1), job("z", 1, 1, 2), job("a", 2, 1, 2)], 1],
    expected: [slot("busy", 0, 0, 3), slot("z", 0, 3, 4), slot("a", 0, 4, 5)],
  },
  { name: "no jobs", args: [[], 2], expected: [] },
  {
    name: "extra workers stay idle",
    args: [[job("a", 0, 2, 1)], 3],
    expected: [slot("a", 0, 0, 2)],
    hidden: true,
  },
  {
    name: "a worker freed at t can take a job arriving at t",
    args: [[job("a", 0, 2, 1), job("b", 2, 1, 1)], 1],
    expected: [slot("a", 0, 0, 2), slot("b", 0, 2, 3)],
    hidden: true,
  },
  {
    name: "a later high-priority job jumps an older low-priority one",
    args: [[job("long", 0, 5, 1), job("low", 1, 1, 1), job("high", 4, 1, 9)], 1],
    expected: [slot("long", 0, 0, 5), slot("high", 0, 5, 6), slot("low", 0, 6, 7)],
    hidden: true,
  },
];
