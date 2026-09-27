import type { TestCase } from "@content/_authoring/types";

export const functionName = "RunAsync";

export const tests: TestCase[] = [
  {
    name: "processes every job",
    args: [["a", "b"]],
    expected: { Log: ["start", "done a", "done b", "stopped: 2 done, 0 failed"], Processed: 2, Failed: 0 },
  },
  {
    name: "a failing job is logged and the loop keeps going",
    args: [["a", "fail-1", "b"]],
    expected: {
      Log: ["start", "done a", "error fail-1: fail-1 exploded", "done b", "stopped: 2 done, 1 failed"],
      Processed: 2,
      Failed: 1,
    },
  },
  {
    name: "shutdown mid-job stops the loop gracefully",
    args: [["a", "shutdown", "b"]],
    expected: { Log: ["start", "done a", "cancelled shutdown", "stopped: 1 done, 0 failed"], Processed: 1, Failed: 0 },
  },
  {
    name: "a timeout is a failure, not a shutdown",
    args: [["timeout-1", "a"]],
    expected: {
      Log: ["start", "error timeout-1: timeout-1 timed out", "done a", "stopped: 1 done, 1 failed"],
      Processed: 1,
      Failed: 1,
    },
  },
  {
    name: "no jobs",
    args: [[]],
    expected: { Log: ["start", "stopped: 0 done, 0 failed"], Processed: 0, Failed: 0 },
  },
  {
    name: "shutdown as the first job",
    args: [["shutdown", "fail-2", "a"]],
    expected: { Log: ["start", "cancelled shutdown", "stopped: 0 done, 0 failed"], Processed: 0, Failed: 0 },
  },
  {
    name: "failures and timeouts before a shutdown are all counted",
    args: [["fail-a", "timeout-b", "c", "shutdown", "timeout-d"]],
    expected: {
      Log: [
        "start",
        "error fail-a: fail-a exploded",
        "error timeout-b: timeout-b timed out",
        "done c",
        "cancelled shutdown",
        "stopped: 1 done, 2 failed",
      ],
      Processed: 1,
      Failed: 2,
    },
    hidden: true,
  },
];
