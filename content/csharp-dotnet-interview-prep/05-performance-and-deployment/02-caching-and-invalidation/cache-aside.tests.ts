import type { TestCase } from "@content/_authoring/types";

export const functionName = "Simulate";

const get = (At: number, Key: string) => ({ At, Kind: "get", Key, Value: null });
const write = (At: number, Key: string, Value: string) => ({ At, Kind: "write", Key, Value });
const db = { "catalog:u1": "v1", "catalog:u2": "a1" };

export const tests: TestCase[] = [
  {
    name: "the first read misses, the second hits",
    args: [db, [get(0, "catalog:u1"), get(10, "catalog:u1")], 60],
    expected: ["miss catalog:u1=v1", "hit catalog:u1=v1"],
  },
  {
    name: "an entry expires after its TTL",
    args: [db, [get(0, "catalog:u1"), get(59, "catalog:u1"), get(60, "catalog:u1")], 60],
    expected: ["miss catalog:u1=v1", "hit catalog:u1=v1", "miss catalog:u1=v1"],
  },
  {
    name: "a write invalidates so the next read sees fresh data",
    args: [db, [get(0, "catalog:u1"), write(5, "catalog:u1", "v2"), get(6, "catalog:u1")], 60],
    expected: ["miss catalog:u1=v1", "write catalog:u1", "miss catalog:u1=v2"],
  },
  {
    name: "keys are cached independently",
    args: [db, [get(0, "catalog:u1"), get(1, "catalog:u2"), write(2, "catalog:u2", "a2"), get(3, "catalog:u1"), get(4, "catalog:u2")], 60],
    expected: ["miss catalog:u1=v1", "miss catalog:u2=a1", "write catalog:u2", "hit catalog:u1=v1", "miss catalog:u2=a2"],
  },
  {
    name: "a missing key is not cached, so every read goes to the database",
    args: [db, [get(0, "catalog:u9"), get(1, "catalog:u9")], 60],
    expected: ["miss catalog:u9=null", "miss catalog:u9=null"],
  },
  {
    name: "a refreshed entry gets a new TTL from the time it was reloaded",
    args: [db, [get(0, "catalog:u1"), get(30, "catalog:u1"), get(31, "catalog:u1"), get(60, "catalog:u1")], 30],
    expected: ["miss catalog:u1=v1", "miss catalog:u1=v1", "hit catalog:u1=v1", "miss catalog:u1=v1"],
    hidden: true,
  },
  {
    name: "a write can create a key that later reads find",
    args: [db, [get(0, "catalog:u3"), write(1, "catalog:u3", "n1"), get(2, "catalog:u3"), get(3, "catalog:u3")], 60],
    expected: ["miss catalog:u3=null", "write catalog:u3", "miss catalog:u3=n1", "hit catalog:u3=n1"],
    hidden: true,
  },
];
