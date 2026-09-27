import type { TestCase } from "@content/_authoring/types";

export const functionName = "PlanTests";

const b = (Name: string, ...Touches: string[]) => ({ Name, Touches });
const plan = (Behavior: string, Layer: string) => ({ Behavior, Layer });

export const tests: TestCase[] = [
  {
    name: "a pure scoring rule is a unit test",
    args: [[b("clamps score to 0..100", "pure-logic")]],
    expected: [plan("clamps score to 0..100", "unit")],
  },
  {
    name: "an endpoint that writes through EF Core is an integration test",
    args: [[b("POST /complete writes review rows", "http", "auth", "ef-core", "database")]],
    expected: [plan("POST /complete writes review rows", "integration")],
  },
  {
    name: "time-dependent logic gets a fake clock, not a real wait",
    args: [[b("streak resets after a missed day", "pure-logic", "clock")]],
    expected: [plan("streak resets after a missed day", "unit-with-fake")],
  },
  {
    name: "a browser journey is end-to-end",
    args: [[b("learner completes a lesson in the UI", "browser", "http", "database")]],
    expected: [plan("learner completes a lesson in the UI", "e2e")],
  },
  {
    name: "orders the plan from cheapest to most expensive",
    args: [
      [
        b("sign-in page renders", "browser"),
        b("options bind from configuration", "di"),
        b("email retry backoff", "external-api"),
        b("XP multiplier caps at 1.5", "pure-logic"),
      ],
    ],
    expected: [
      plan("XP multiplier caps at 1.5", "unit"),
      plan("email retry backoff", "unit-with-fake"),
      plan("options bind from configuration", "integration"),
      plan("sign-in page renders", "e2e"),
    ],
  },
  {
    name: "framework wiring wins over an external API: the API is faked inside an integration test",
    args: [[b("reminder job queries due users and emails them", "database", "external-api")]],
    expected: [plan("reminder job queries due users and emails them", "integration")],
    hidden: true,
  },
  {
    name: "same-layer behaviors keep their input order, and no touches means unit",
    args: [
      [
        b("JSON contract is camelCase", "serialization"),
        b("slugify trims dashes"),
        b("route requires auth", "routing", "auth"),
        b("shuffle is deterministic with a seed", "random"),
      ],
    ],
    expected: [
      plan("slugify trims dashes", "unit"),
      plan("shuffle is deterministic with a seed", "unit-with-fake"),
      plan("JSON contract is camelCase", "integration"),
      plan("route requires auth", "integration"),
    ],
    hidden: true,
  },
];
