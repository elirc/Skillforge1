import type { TestCase } from "@content/_authoring/types";

export const functionName = "Build";

const p = (Id: string, Name: string, Price: number) => ({ Id, Name, Price });
const s = (Id: string, Name: string, Rating: number) => ({ Id, Name, Rating });

export const tests: TestCase[] = [
  {
    name: "stores both entity types and orders them by Id",
    args: [[p("p2", "Tee", 20), p("p1", "Mug", 12)], [s("s2", "Acme", 4), s("s1", "Globex", 5)]],
    expected: { ProductIds: ["p1", "p2"], SupplierIds: ["s1", "s2"], Cheapest: "Mug", TopRated: "Globex" },
  },
  {
    name: "upsert replaces an item with the same Id",
    args: [[p("p1", "Mug", 12), p("p2", "Tee", 20), p("p1", "Big Mug", 30)], [s("s1", "Acme", 3)]],
    expected: { ProductIds: ["p1", "p2"], SupplierIds: ["s1"], Cheapest: "Tee", TopRated: "Acme" },
  },
  {
    name: "empty repositories report null names",
    args: [[], []],
    expected: { ProductIds: [], SupplierIds: [], Cheapest: null, TopRated: null },
  },
  {
    name: "ties go to the lower Id",
    args: [[p("p9", "Late", 5), p("p3", "Early", 5)], [s("s8", "Beta", 5), s("s4", "Alpha", 5)]],
    expected: { ProductIds: ["p3", "p9"], SupplierIds: ["s4", "s8"], Cheapest: "Early", TopRated: "Alpha" },
  },
  {
    name: "Ids are ordered ordinally, so uppercase sorts before lowercase",
    args: [[p("b", "Lower", 3), p("B", "Upper", 4)], []],
    expected: { ProductIds: ["B", "b"], SupplierIds: [], Cheapest: "Lower", TopRated: null },
  },
  {
    name: "the replaced version is the one that counts",
    args: [[p("p1", "Cheap", 1), p("p2", "Mid", 10), p("p1", "Now Pricey", 100)], [s("s1", "Old Star", 5), s("s1", "Fallen", 1), s("s2", "Steady", 3)]],
    expected: { ProductIds: ["p1", "p2"], SupplierIds: ["s1", "s2"], Cheapest: "Mid", TopRated: "Steady" },
    hidden: true,
  },
  {
    name: "one product and no suppliers",
    args: [[p("p1", "Solo", 7.5)], []],
    expected: { ProductIds: ["p1"], SupplierIds: [], Cheapest: "Solo", TopRated: null },
    hidden: true,
  },
];
