import type { TestCase } from "@content/_authoring/types";

export const functionName = "BuildLogEvent";

export const tests: TestCase[] = [
  {
    name: "renders the message and keeps each field queryable",
    args: ["Completed lesson {LessonId} for user {UserId} in {ElapsedMs}ms", ["l-42", "u-7", "18"]],
    expected: {
      Message: "Completed lesson l-42 for user u-7 in 18ms",
      Properties: { LessonId: "l-42", UserId: "u-7", ElapsedMs: "18" },
    },
  },
  {
    name: "redacts secrets in both the message and the properties",
    args: ["Calling provider for {UserId} with {AccessToken}", ["u-7", "eyJhbGciOi"]],
    expected: {
      Message: "Calling provider for u-7 with ***",
      Properties: { UserId: "u-7", AccessToken: "***" },
    },
  },
  {
    name: "the @ destructuring prefix is not part of the property name",
    args: ["Graded {@Review}", ["{ Grade = 4 }"]],
    expected: { Message: "Graded { Grade = 4 }", Properties: { Review: "{ Grade = 4 }" } },
  },
  {
    name: "a placeholder without an argument stays as written",
    args: ["Retry {Attempt} of {MaxAttempts}", ["2"]],
    expected: { Message: "Retry 2 of {MaxAttempts}", Properties: { Attempt: "2" } },
  },
  {
    name: "a template without placeholders has no properties",
    args: ["Cache warmed", []],
    expected: { Message: "Cache warmed", Properties: {} },
  },
  {
    name: "arguments bind by position and extra arguments are ignored",
    args: ["{B} then {A}", ["first", "second", "third"]],
    expected: { Message: "first then second", Properties: { B: "first", A: "second" } },
    hidden: true,
  },
  {
    name: "redaction ignores casing and matches inside longer names",
    args: ["Login for {Email} with {userPassword} and {StripeApiKey}", ["a@b.test", "hunter2", "sk_live_1"]],
    expected: {
      Message: "Login for a@b.test with *** and ***",
      Properties: { Email: "a@b.test", userPassword: "***", StripeApiKey: "***" },
    },
    hidden: true,
  },
];
