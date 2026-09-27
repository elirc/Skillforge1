import type { TestCase } from "@content/_authoring/types";

export const functionName = "summarizePayments";

export const tests: TestCase[] = [
  {
    name: "NULL amounts are skipped by everything except COUNT(*)",
    args: [
      [
        { id: 1, customerId: 7, amount: 10 },
        { id: 2, customerId: 7, amount: 20 },
        { id: 3, customerId: 8, amount: null },
        { id: 4, customerId: 9, amount: 30 },
      ],
    ],
    expected: {
      countStar: 4,
      countAmount: 3,
      distinctCustomers: 3,
      sumAmount: 60,
      avgAmount: 20,
      minAmount: 10,
      maxAmount: 30,
    },
  },
  {
    name: "COUNT(DISTINCT) ignores NULL customers and AVG keeps fractions",
    args: [
      [
        { id: 1, customerId: null, amount: 5 },
        { id: 2, customerId: 3, amount: 10 },
        { id: 3, customerId: 3, amount: null },
      ],
    ],
    expected: {
      countStar: 3,
      countAmount: 2,
      distinctCustomers: 1,
      sumAmount: 15,
      avgAmount: 7.5,
      minAmount: 5,
      maxAmount: 10,
    },
  },
  {
    name: "an empty table: counts are 0, the rest are NULL",
    args: [[]],
    expected: {
      countStar: 0,
      countAmount: 0,
      distinctCustomers: 0,
      sumAmount: null,
      avgAmount: null,
      minAmount: null,
      maxAmount: null,
    },
    hidden: true,
  },
  {
    name: "rows whose amounts are all NULL still count in COUNT(*)",
    args: [
      [
        { id: 1, customerId: 1, amount: null },
        { id: 2, customerId: 2, amount: null },
      ],
    ],
    expected: {
      countStar: 2,
      countAmount: 0,
      distinctCustomers: 2,
      sumAmount: null,
      avgAmount: null,
      minAmount: null,
      maxAmount: null,
    },
    hidden: true,
  },
];
