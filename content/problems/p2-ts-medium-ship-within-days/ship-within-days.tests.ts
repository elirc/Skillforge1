import type { TestCase } from "@content/_authoring/types";

export const functionName = "minTruckCapacity";

export const tests: TestCase[] = [
  { name: "ten parcels in five days", args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], expected: 15 },
  { name: "three days", args: [[3, 2, 2, 4, 1, 4], 3], expected: 6 },
  { name: "four days", args: [[1, 2, 3, 1, 1], 4], expected: 3 },
  { name: "the heaviest parcel sets the floor", args: [[10], 3], expected: 10 },
  { name: "no parcels", args: [[], 2], expected: 0 },
  { name: "one day means everything at once", args: [[5, 5, 5, 5], 1], expected: 20 },
  { name: "one parcel per day", args: [[5, 5, 5, 5], 4], expected: 5, hidden: true },
  { name: "split into two days", args: [[7, 2, 5, 10, 8], 2], expected: 18, hidden: true },
];
