import type { TestCase } from "@content/_authoring/types";

export const functionName = "likeFilter";

const products = ["Blue Mug", "blue plate", "Red Mug", "Mug", "Bluetooth Speaker", "50% Off Mug", "A.B Tool"];

export const tests: TestCase[] = [
  { name: "prefix match with %: 'blue%'", args: [products, "blue%"], expected: ["Blue Mug", "blue plate", "Bluetooth Speaker"] },
  { name: "suffix match: '%mug' (a leading wildcard cannot use an index seek)", args: [products, "%mug"], expected: ["Blue Mug", "Red Mug", "Mug", "50% Off Mug"] },
  { name: "contains: '%tooth%'", args: [products, "%tooth%"], expected: ["Bluetooth Speaker"] },
  { name: "_ matches exactly one character", args: [products, "___ Mug"], expected: ["Red Mug"] },
  { name: "without wildcards LIKE is a whole-value match", args: [products, "mug"], expected: ["Mug"] },
  { name: "a dot is literal, not a regex wildcard", args: [products, "A.B%"], expected: ["A.B Tool"] },
  { name: "escaped \\% matches a literal percent sign", args: [products, "%\\%%"], expected: ["50% Off Mug"], hidden: true },
  { name: "no matches", args: [products, "green%"], expected: [], hidden: true },
  { name: "regex characters in the pattern are literal", args: [["(x)+y", "xy"], "(x)+%"], expected: ["(x)+y"], hidden: true },
];
