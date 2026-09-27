import type { TestCase } from "@content/_authoring/types";

export const functionName = "parseUsers";

export const tests: TestCase[] = [
  {
    name: "picks id, name, and email from each user",
    args: ['{"data":{"users":[{"id":1,"email":"ada@example.com","role":"admin","profile":{"name":"Ada","city":"London"}}]}}'],
    expected: [{ id: 1, name: "Ada", email: "ada@example.com" }],
  },
  {
    name: "a missing profile name becomes Unknown",
    args: ['{"data":{"users":[{"id":2,"email":"b@example.com","profile":{}}]}}'],
    expected: [{ id: 2, name: "Unknown", email: "b@example.com" }],
  },
  {
    name: "a missing profile object also becomes Unknown",
    args: ['{"data":{"users":[{"id":3,"email":"c@example.com"}]}}'],
    expected: [{ id: 3, name: "Unknown", email: "c@example.com" }],
  },
  {
    name: "a missing or null email becomes null",
    args: ['{"data":{"users":[{"id":4,"profile":{"name":"Dee"}},{"id":5,"email":null,"profile":{"name":"Eli"}}]}}'],
    expected: [
      { id: 4, name: "Dee", email: null },
      { id: 5, name: "Eli", email: null },
    ],
  },
  { name: "invalid JSON returns an empty list", args: ["{not json"], expected: [] },
  { name: "a response without data.users returns an empty list", args: ['{"error":"rate limited"}'], expected: [] },
  {
    name: "users without a numeric id are skipped",
    args: ['{"data":{"users":[{"email":"x@example.com"},{"id":"7"},{"id":8,"profile":{"name":"Hal"}}]}}'],
    expected: [{ id: 8, name: "Hal", email: null }],
    hidden: true,
  },
  { name: "the JSON text null returns an empty list", args: ["null"], expected: [], hidden: true },
];
