import type { TestCase } from "@content/_authoring/types";

export const functionName = "ApplyEdits";

const p = (Sku: string, Name: string, Price: number, Currency = "USD") => ({ Sku, Name, Price, Currency });
const e = (Sku: string, NewPrice: number) => ({ Sku, NewPrice });

export const tests: TestCase[] = [
  {
    name: "a single edit produces a new row and reports the SKU",
    args: [[p("MUG", "Mug", 12), p("TEE", "Tee", 20)], [e("TEE", 18)]],
    expected: { Catalog: [p("MUG", "Mug", 12), p("TEE", "Tee", 18)], ChangedSkus: ["TEE"], DuplicatesRemoved: 0 },
  },
  {
    name: "exact duplicate rows are removed by value equality",
    args: [[p("MUG", "Mug", 12), p("MUG", "Mug", 12), p("TEE", "Tee", 20)], []],
    expected: { Catalog: [p("MUG", "Mug", 12), p("TEE", "Tee", 20)], ChangedSkus: [], DuplicatesRemoved: 1 },
  },
  {
    name: "rows that differ in any property are not duplicates",
    args: [[p("MUG", "Mug", 12, "USD"), p("MUG", "Mug", 12, "EUR")], []],
    expected: { Catalog: [p("MUG", "Mug", 12, "USD"), p("MUG", "Mug", 12, "EUR")], ChangedSkus: [], DuplicatesRemoved: 0 },
  },
  {
    name: "setting the current price is not a change",
    args: [[p("MUG", "Mug", 12)], [e("MUG", 12)]],
    expected: { Catalog: [p("MUG", "Mug", 12)], ChangedSkus: [], DuplicatesRemoved: 0 },
  },
  {
    name: "changing a price and then changing it back is not a change",
    args: [[p("MUG", "Mug", 12), p("TEE", "Tee", 20)], [e("MUG", 15), e("TEE", 25), e("MUG", 12)]],
    expected: { Catalog: [p("MUG", "Mug", 12), p("TEE", "Tee", 25)], ChangedSkus: ["TEE"], DuplicatesRemoved: 0 },
  },
  {
    name: "unknown SKUs are ignored",
    args: [[p("MUG", "Mug", 12)], [e("LAMP", 40)]],
    expected: { Catalog: [p("MUG", "Mug", 12)], ChangedSkus: [], DuplicatesRemoved: 0 },
  },
  {
    name: "an edit updates every row with that SKU and the SKU is listed once",
    args: [[p("CAP", "Cap", 9, "USD"), p("MUG", "Mug", 12), p("CAP", "Cap", 9, "EUR"), p("CAP", "Cap", 9, "USD")], [e("CAP", 11)]],
    expected: { Catalog: [p("CAP", "Cap", 11, "USD"), p("MUG", "Mug", 12), p("CAP", "Cap", 11, "EUR")], ChangedSkus: ["CAP"], DuplicatesRemoved: 1 },
    hidden: true,
  },
  {
    name: "changed SKUs follow catalog order, not edit order",
    args: [[p("A", "A", 1), p("B", "B", 2), p("C", "C", 3)], [e("C", 30), e("A", 10)]],
    expected: { Catalog: [p("A", "A", 10), p("B", "B", 2), p("C", "C", 30)], ChangedSkus: ["A", "C"], DuplicatesRemoved: 0 },
    hidden: true,
  },
];
