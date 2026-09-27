import type { TestCase } from "@content/_authoring/types";

export const functionName = "parseQuery";

export const tests: TestCase[] = [
  { name: "parses flat pairs", args: ["q=shoes&page=2"], expected: { q: "shoes", page: "2" } },
  {
    name: "decodes plus signs and percent escapes",
    args: ["q=red+running%20shoes&sort=price%3Aasc&tag=c%2B%2B"],
    expected: { q: "red running shoes", sort: "price:asc", tag: "c++" },
  },
  { name: "appends with []", args: ["tags[]=a&tags[]=b"], expected: { tags: ["a", "b"] } },
  {
    name: "nests bracket keys",
    args: ["user[name]=Ada&user[address][city]=Oslo&user[address][zip]=0150"],
    expected: { user: { name: "Ada", address: { city: "Oslo", zip: "0150" } } },
  },
  {
    name: "handles a leading ?, empty pieces and missing =",
    args: ["?a=1&&flag&b="],
    expected: { a: "1", flag: "", b: "" },
  },
  { name: "a repeated plain key keeps the last value", args: ["sort=name&sort=date"], expected: { sort: "date" } },
  {
    name: "combines nested objects and arrays",
    args: ["filter[status][]=open&filter[status][]=closed&filter[q]=x"],
    expected: { filter: { status: ["open", "closed"], q: "x" } },
  },
  {
    name: "blocks prototype pollution",
    args: ["__proto__[admin]=1&constructor[prototype][x]=1&ok=1"],
    expected: { ok: "1" },
    hidden: true,
  },
  {
    name: "keeps malformed percent escapes as text",
    args: ["a=100%&b=%E0%A4%A"],
    expected: { a: "100%", b: "%E0%A4%A" },
    hidden: true,
  },
  {
    name: "replaces a value that has the wrong shape",
    args: ["a=1&a[b]=2&c[]=x&c[d]=y"],
    expected: { a: { b: "2" }, c: { d: "y" } },
    hidden: true,
  },
  {
    name: "decodes the key before splitting brackets",
    args: ["a%5Bb%5D=1&x[]y=2"],
    expected: { a: { b: "1" }, "x[]y": "2" },
    hidden: true,
  },
];
