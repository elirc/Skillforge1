import type { TestCase } from "@content/_authoring/types";

export const functionName = "Handle";

const req = (Key: string, Payload: string, At: number) => ({ Key, Payload, At });
const charge = '{"amount":1200,"currency":"usd"}';
const other = '{"amount":9900,"currency":"usd"}';

export const tests: TestCase[] = [
  {
    name: "new keys create payments",
    args: [[req("k1", charge, 0), req("k2", charge, 1)], 60],
    expected: ["201 created #1", "201 created #2"],
  },
  {
    name: "a retry replays the original response",
    args: [[req("k1", charge, 0), req("k1", charge, 5)], 60],
    expected: ["201 created #1", "200 replay #1"],
  },
  {
    name: "reusing a key for a different body is rejected",
    args: [[req("k1", charge, 0), req("k1", other, 5)], 60],
    expected: ["201 created #1", "422 key reused with different payload"],
  },
  {
    name: "an expired key is processed again",
    args: [[req("k1", charge, 0), req("k1", charge, 60)], 60],
    expected: ["201 created #1", "201 created #2"],
  },
  {
    name: "a blank key is rejected without using a number",
    args: [[req("  ", charge, 0), req("k1", charge, 1)], 60],
    expected: ["400 missing key", "201 created #1"],
  },
  {
    name: "one second before expiry still replays",
    args: [[req("k1", charge, 0), req("k1", charge, 59)], 60],
    expected: ["201 created #1", "200 replay #1"],
  },
  {
    name: "a rejected reuse does not overwrite the stored entry",
    args: [[req("k1", charge, 0), req("k1", other, 1), req("k1", charge, 2)], 60],
    expected: ["201 created #1", "422 key reused with different payload", "200 replay #1"],
    hidden: true,
  },
  {
    name: "after expiry a different body is a fresh request",
    args: [[req("k1", charge, 0), req("k1", other, 100)], 60],
    expected: ["201 created #1", "201 created #2"],
    hidden: true,
  },
  {
    name: "keys are case-sensitive",
    args: [[req("abc", charge, 0), req("ABC", charge, 1)], 60],
    expected: ["201 created #1", "201 created #2"],
    hidden: true,
  },
];
