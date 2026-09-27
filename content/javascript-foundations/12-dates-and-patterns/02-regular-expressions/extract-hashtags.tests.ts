import type { TestCase } from "@content/_authoring/types";

export const functionName = "extractHashtags";

export const tests: TestCase[] = [
  { name: "finds one tag", args: ["Learning #javascript today"], expected: ["javascript"] },
  { name: "finds several tags in order", args: ["#arrays then #loops then #maps"], expected: ["arrays", "loops", "maps"] },
  { name: "lowercases tags", args: ["Go #TypeScript"], expected: ["typescript"] },
  { name: "repeats appear once", args: ["#js is fun #JS #js"], expected: ["js"] },
  { name: "punctuation ends a tag", args: ["Done with #regex, next: #dates!"], expected: ["regex", "dates"] },
  { name: "digits and underscores are allowed", args: ["#day_42 streak"], expected: ["day_42"] },
  { name: "no tags gives an empty list", args: ["plain text"], expected: [], hidden: true },
  { name: "a lone # is not a tag", args: ["# heading and #real"], expected: ["real"], hidden: true },
];
