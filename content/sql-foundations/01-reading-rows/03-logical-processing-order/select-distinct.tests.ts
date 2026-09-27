import type { TestCase } from "@content/_authoring/types";

export const functionName = "selectDistinct";

export const tests: TestCase[] = [
  {
    name: "removes duplicate cities and sorts them",
    args: [
      [
        { id: 1, name: "Ada", city: "Paris" },
        { id: 2, name: "Bo", city: "Austin" },
        { id: 3, name: "Cy", city: "Paris" },
        { id: 4, name: "Di", city: "Lima" },
      ],
    ],
    expected: ["Austin", "Lima", "Paris"],
  },
  {
    name: "many NULL cities collapse into one NULL that sorts first",
    args: [
      [
        { id: 1, name: "Ada", city: null },
        { id: 2, name: "Bo", city: "Oslo" },
        { id: 3, name: "Cy", city: null },
        { id: 4, name: "Di", city: "Berlin" },
      ],
    ],
    expected: [null, "Berlin", "Oslo"],
  },
  {
    name: "a single row returns a single city",
    args: [[{ id: 9, name: "Ed", city: "Rome" }]],
    expected: ["Rome"],
    hidden: true,
  },
  { name: "an empty table returns no rows", args: [[]], expected: [], hidden: true },
];
