import type { TestCase } from "@content/_authoring/types";

export const functionName = "evaluatePreconditions";

const product = { etag: '"v7"', lastModified: "2026-09-01T10:00:00.500Z" };
const OUT = { ETag: '"v7"', "Last-Modified": "Tue, 01 Sep 2026 10:00:00 GMT" };

export const tests: TestCase[] = [
  { name: "a plain GET is 200 with validators", args: ["GET", product, {}], expected: { status: 200, headers: OUT } },
  { name: "a matching If-None-Match is 304", args: ["GET", product, { "if-none-match": '"v7"' }], expected: { status: 304, headers: OUT } },
  {
    name: "If-None-Match uses weak comparison and accepts a list",
    args: ["GET", product, { "if-none-match": '"v5", W/"v7"' }],
    expected: { status: 304, headers: OUT },
  },
  {
    name: "If-Modified-Since at the same second is 304",
    args: ["GET", product, { "if-modified-since": "Tue, 01 Sep 2026 10:00:00 GMT" }],
    expected: { status: 304, headers: OUT },
  },
  { name: "a PUT without If-Match is 428", args: ["PUT", product, {}], expected: { status: 428 } },
  { name: "a PUT with the current ETag may proceed", args: ["PUT", product, { "if-match": '"v7"' }], expected: { status: 200 } },
  { name: "a PATCH with an old ETag is 412", args: ["PATCH", product, { "if-match": '"v6"' }], expected: { status: 412 } },
  {
    name: "If-None-Match wins over If-Modified-Since",
    args: ["HEAD", product, { "if-none-match": '"v1"', "if-modified-since": "Wed, 02 Sep 2026 00:00:00 GMT" }],
    expected: { status: 200, headers: OUT },
    hidden: true,
  },
  { name: "weak tags never satisfy If-Match", args: ["DELETE", product, { "if-match": 'W/"v7"' }], expected: { status: 412 }, hidden: true },
  {
    name: "a resource changed after the date is 200",
    args: ["GET", product, { "if-modified-since": "Tue, 01 Sep 2026 09:59:59 GMT" }],
    expected: { status: 200, headers: OUT },
    hidden: true,
  },
];
