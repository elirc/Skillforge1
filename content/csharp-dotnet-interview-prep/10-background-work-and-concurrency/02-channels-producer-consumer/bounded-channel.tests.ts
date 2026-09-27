import type { TestCase } from "@content/_authoring/types";

export const functionName = "Simulate";

export const tests: TestCase[] = [
  {
    name: "Wait: a full channel blocks the producer until the consumer reads",
    args: [2, "Wait", ["write:a", "write:b", "write:c", "read", "read", "read", "read"]],
    expected: {
      Consumed: ["a", "b", "c"],
      Dropped: [],
      Log: ["wrote a", "wrote b", "blocked c", "read a", "unblocked c", "read b", "read c", "read: empty"],
    },
  },
  {
    name: "DropOldest: the oldest buffered item makes room",
    args: [2, "DropOldest", ["write:a", "write:b", "write:c", "read", "read"]],
    expected: {
      Consumed: ["b", "c"],
      Dropped: ["a"],
      Log: ["wrote a", "wrote b", "dropped a", "wrote c", "read b", "read c"],
    },
  },
  {
    name: "DropNewest: the newest buffered item makes room",
    args: [2, "DropNewest", ["write:a", "write:b", "write:c", "read", "read"]],
    expected: {
      Consumed: ["a", "c"],
      Dropped: ["b"],
      Log: ["wrote a", "wrote b", "dropped b", "wrote c", "read a", "read c"],
    },
  },
  {
    name: "DropWrite: the incoming item is discarded",
    args: [1, "DropWrite", ["write:a", "write:b", "read", "write:c", "read"]],
    expected: {
      Consumed: ["a", "c"],
      Dropped: ["b"],
      Log: ["wrote a", "dropped b", "read a", "wrote c", "read c"],
    },
  },
  {
    name: "after Complete, writes are rejected but buffered items drain",
    args: [2, "Wait", ["write:a", "complete", "write:b", "read", "read"]],
    expected: {
      Consumed: ["a"],
      Dropped: [],
      Log: ["wrote a", "complete", "rejected b", "read a", "read: completed"],
    },
  },
  {
    name: "Complete fails every blocked writer, oldest first",
    args: [1, "Wait", ["write:a", "write:b", "write:c", "complete", "read", "read", "complete"]],
    expected: {
      Consumed: ["a"],
      Dropped: [],
      Log: ["wrote a", "blocked b", "blocked c", "complete", "rejected b", "rejected c", "read a", "read: completed"],
    },
  },
  {
    name: "DropOldest with capacity 1 keeps only the latest item",
    args: [1, "DropOldest", ["write:1", "write:2", "write:3", "read"]],
    expected: {
      Consumed: ["3"],
      Dropped: ["1", "2"],
      Log: ["wrote 1", "dropped 1", "wrote 2", "dropped 2", "wrote 3", "read 3"],
    },
    hidden: true,
  },
  {
    name: "Wait keeps producer and consumer in lockstep",
    args: [1, "Wait", ["read", "write:x", "write:y", "read", "write:z", "read", "read"]],
    expected: {
      Consumed: ["x", "y", "z"],
      Dropped: [],
      Log: ["read: empty", "wrote x", "blocked y", "read x", "unblocked y", "blocked z", "read y", "unblocked z", "read z"],
    },
    hidden: true,
  },
];
