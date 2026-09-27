import type { TestCase } from "@content/_authoring/types";

export const functionName = "QuoteFor";

const parcel = (Country: string, OrderTotal: number, WeightKg: number, Tags: string[] = []) => ({
  Country,
  OrderTotal,
  WeightKg,
  Tags,
});

export const tests: TestCase[] = [
  {
    name: "US orders of 50 or more ship free",
    args: [parcel("US", 50, 3)],
    expected: { Cost: 0, Rule: "us-free", Surcharge: 0 },
  },
  {
    name: "a light US parcel uses the light rate",
    args: [parcel("US", 20, 0.5)],
    expected: { Cost: 4.99, Rule: "us-light", Surcharge: 0 },
  },
  {
    name: "Canada or Mexico up to 5 kg",
    args: [parcel("MX", 80, 5)],
    expected: { Cost: 14.99, Rule: "north-america", Surcharge: 0 },
  },
  {
    name: "heavier North American parcels",
    args: [parcel("CA", 10, 7.5)],
    expected: { Cost: 24.99, Rule: "north-america-heavy", Surcharge: 0 },
  },
  {
    name: "express as the first tag adds 10",
    args: [parcel("DE", 10, 2, ["express", "gift"])],
    expected: { Cost: 49.99, Rule: "international", Surcharge: 10 },
  },
  {
    name: "fragile as the last tag adds 3",
    args: [parcel("US", 20, 2, ["gift", "fragile"])],
    expected: { Cost: 11.99, Rule: "us-standard", Surcharge: 3 },
  },
  {
    name: "too heavy wins over every other rule and skips surcharges",
    args: [parcel("US", 500, 31, ["express"])],
    expected: { Cost: -1, Rule: "too-heavy", Surcharge: 0 },
  },
  {
    name: "express first and fragile last adds 13",
    args: [parcel("US", 60, 2, ["express", "gift", "fragile"])],
    expected: { Cost: 13, Rule: "us-free", Surcharge: 13 },
    hidden: true,
  },
  {
    name: "a single express tag is both first and last, but not fragile",
    args: [parcel("CA", 10, 1, ["express"])],
    expected: { Cost: 24.99, Rule: "north-america", Surcharge: 10 },
    hidden: true,
  },
  {
    name: "fragile in the middle does not count; exactly 30 kg is shippable",
    args: [parcel("JP", 10, 30, ["fragile", "gift"])],
    expected: { Cost: 39.99, Rule: "international", Surcharge: 0 },
    hidden: true,
  },
];
