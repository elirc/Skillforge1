import type { TestCase } from "@content/_authoring/types";

export const functionName = "employeesWithManagers";

export const tests: TestCase[] = [
  {
    name: "pairs each employee with their manager's name",
    args: [
      [
        { id: 1, name: "Grace", managerId: null },
        { id: 2, name: "Alan", managerId: 1 },
        { id: 3, name: "Linus", managerId: 2 },
      ],
    ],
    expected: [
      { employee: "Grace", manager: null },
      { employee: "Alan", manager: "Grace" },
      { employee: "Linus", manager: "Alan" },
    ],
  },
  {
    name: "orders by employee id and keeps a dangling manager id as NULL",
    args: [
      [
        { id: 5, name: "Margaret", managerId: 4 },
        { id: 4, name: "Ken", managerId: null },
        { id: 6, name: "Barbara", managerId: 99 },
      ],
    ],
    expected: [
      { employee: "Ken", manager: null },
      { employee: "Margaret", manager: "Ken" },
      { employee: "Barbara", manager: null },
    ],
  },
  { name: "an empty table returns no rows", args: [[]], expected: [], hidden: true },
  {
    name: "several reports share one manager",
    args: [
      [
        { id: 1, name: "Boss", managerId: null },
        { id: 2, name: "Ann", managerId: 1 },
        { id: 3, name: "Ben", managerId: 1 },
      ],
    ],
    expected: [
      { employee: "Boss", manager: null },
      { employee: "Ann", manager: "Boss" },
      { employee: "Ben", manager: "Boss" },
    ],
    hidden: true,
  },
];
