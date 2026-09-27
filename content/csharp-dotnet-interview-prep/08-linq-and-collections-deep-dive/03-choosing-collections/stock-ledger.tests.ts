import type { TestCase } from "@content/_authoring/types";

export const functionName = "Replay";

const ev = (EventId: string, Sku: string, Warehouse: string, Delta: number) => ({ EventId, Sku, Warehouse, Delta });

export const tests: TestCase[] = [
  {
    name: "sums deltas per SKU and lists warehouses",
    args: [[ev("e1", "MUG", "LON", 10), ev("e2", "TEE", "NYC", 5), ev("e3", "MUG", "NYC", -3)]],
    expected: {
      Levels: ["MUG=7", "TEE=5"],
      DuplicateEventIds: [],
      Locations: ["MUG: LON, NYC", "TEE: NYC"],
    },
  },
  {
    name: "a redelivered event is applied once and reported",
    args: [[ev("e1", "MUG", "LON", 10), ev("e1", "MUG", "LON", 10), ev("e2", "MUG", "LON", 1)]],
    expected: { Levels: ["MUG=11"], DuplicateEventIds: ["e1"], Locations: ["MUG: LON"] },
  },
  {
    name: "SKUs are case-insensitive and keep their first casing",
    args: [[ev("e1", "Mug", "LON", 4), ev("e2", "MUG", "PAR", 2), ev("e3", "mug", "LON", 1)]],
    expected: { Levels: ["Mug=7"], DuplicateEventIds: [], Locations: ["Mug: LON, PAR"] },
  },
  {
    name: "levels are ordered by SKU ignoring case",
    args: [[ev("e1", "tee", "A", 1), ev("e2", "Cap", "A", 1), ev("e3", "BAG", "A", 1)]],
    expected: {
      Levels: ["BAG=1", "Cap=1", "tee=1"],
      DuplicateEventIds: [],
      Locations: ["BAG: A", "Cap: A", "tee: A"],
    },
  },
  {
    name: "every repeat is reported in arrival order",
    args: [[ev("e2", "A", "W", 1), ev("e1", "A", "W", 1), ev("e2", "A", "W", 1), ev("e1", "A", "W", 1), ev("e2", "A", "W", 1)]],
    expected: { Levels: ["A=2"], DuplicateEventIds: ["e2", "e1", "e2"], Locations: ["A: W"] },
  },
  {
    name: "no events",
    args: [[]],
    expected: { Levels: [], DuplicateEventIds: [], Locations: [] },
  },
  {
    name: "a level can reach zero or below and warehouses sort ordinally",
    args: [[ev("e1", "MUG", "nyc", 2), ev("e2", "MUG", "LON", -5), ev("e3", "MUG", "NYC", 0)]],
    expected: { Levels: ["MUG=-3"], DuplicateEventIds: [], Locations: ["MUG: LON, NYC, nyc"] },
    hidden: true,
  },
  {
    name: "a duplicate EventId with a different payload is still a duplicate",
    args: [[ev("e1", "MUG", "LON", 10), ev("e1", "TEE", "PAR", 99)]],
    expected: { Levels: ["MUG=10"], DuplicateEventIds: ["e1"], Locations: ["MUG: LON"] },
    hidden: true,
  },
];
