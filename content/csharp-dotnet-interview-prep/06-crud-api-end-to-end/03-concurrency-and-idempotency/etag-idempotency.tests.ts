import type { TestCase } from "@content/_authoring/types";

export const functionName = "Process";

interface Req {
  Id?: string;
  IfMatch?: string;
  IdempotencyKey?: string;
  Body?: string;
}

const req = (Method: string, { Id, IfMatch, IdempotencyKey, Body }: Req = {}) => ({
  Method,
  Id: Id ?? null,
  IfMatch: IfMatch ?? null,
  IdempotencyKey: IdempotencyKey ?? null,
  Body: Body ?? null,
});
const res = (Status: number, Id: string | null = null, ETag: string | null = null) => ({ Status, Id, ETag });

export const tests: TestCase[] = [
  {
    name: "create, read, then update with the matching ETag",
    args: [
      [
        req("POST", { Body: "draft" }),
        req("GET", { Id: "n1" }),
        req("PUT", { Id: "n1", IfMatch: "v1", Body: "final" }),
        req("GET", { Id: "n1" }),
      ],
    ],
    expected: [res(201, "n1", "v1"), res(200, "n1", "v1"), res(200, "n1", "v2"), res(200, "n1", "v2")],
  },
  {
    name: "the second of two writers holding the same ETag gets 412",
    args: [
      [
        req("POST", { Body: "shared" }),
        req("PUT", { Id: "n1", IfMatch: "v1", Body: "alice" }),
        req("PUT", { Id: "n1", IfMatch: "v1", Body: "bob" }),
      ],
    ],
    expected: [res(201, "n1", "v1"), res(200, "n1", "v2"), res(412, "n1", "v2")],
  },
  {
    name: "an update without If-Match is refused with 428",
    args: [[req("POST", { Body: "x" }), req("PUT", { Id: "n1", Body: "y" })]],
    expected: [res(201, "n1", "v1"), res(428, "n1")],
  },
  {
    name: "a retried POST with the same idempotency key replays the first response",
    args: [
      [
        req("POST", { IdempotencyKey: "k-1", Body: "order" }),
        req("POST", { IdempotencyKey: "k-1", Body: "order" }),
        req("POST", { Body: "other" }),
      ],
    ],
    expected: [res(201, "n1", "v1"), res(201, "n1", "v1"), res(201, "n2", "v1")],
  },
  {
    name: "reusing a key with a different body is a client error",
    args: [[req("POST", { IdempotencyKey: "k-1", Body: "a" }), req("POST", { IdempotencyKey: "k-1", Body: "b" })]],
    expected: [res(201, "n1", "v1"), res(422)],
  },
  {
    name: "unknown ids are 404 for GET and PUT",
    args: [[req("GET", { Id: "n7" }), req("PUT", { Id: "n7", IfMatch: "v1", Body: "z" })]],
    expected: [res(404, "n7"), res(404, "n7")],
    hidden: true,
  },
  {
    name: "a replay returns the ORIGINAL response even after the note changed",
    args: [
      [
        req("POST", { IdempotencyKey: "k-9", Body: "a" }),
        req("PUT", { Id: "n1", IfMatch: "v1", Body: "b" }),
        req("POST", { IdempotencyKey: "k-9", Body: "a" }),
        req("DELETE", { Id: "n1" }),
      ],
    ],
    expected: [res(201, "n1", "v1"), res(200, "n1", "v2"), res(201, "n1", "v1"), res(405, "n1")],
    hidden: true,
  },
  {
    name: "without keys, two identical POSTs create two notes",
    args: [[req("POST", { Body: "same" }), req("POST", { Body: "same" }), req("PUT", { Id: "n2", IfMatch: "v1", Body: "x" })]],
    expected: [res(201, "n1", "v1"), res(201, "n2", "v1"), res(200, "n2", "v2")],
    hidden: true,
  },
];
