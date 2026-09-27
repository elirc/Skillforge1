import type { TestCase } from "@content/_authoring/types";

export const functionName = "Validate";

const valid = { Name: "Ada Lovelace", Email: "ada@example.com", Age: 36, Country: "US", PostalCode: "94107" };

export const tests: TestCase[] = [
  { name: "a valid request has no errors", args: [valid], expected: {} },
  {
    name: "reports every failing field",
    args: [{ ...valid, Name: null, Email: "ada.example.com" }],
    expected: { Name: ["Name is required."], Email: ["Email is not valid."] },
  },
  {
    name: "age is required and range-checked",
    args: [{ ...valid, Age: 17, Email: null }],
    expected: { Email: ["Email is required."], Age: ["Age must be between 18 and 120."] },
  },
  {
    name: "an unsupported country skips the postal code check",
    args: [{ ...valid, Country: "FR", PostalCode: "not checked" }],
    expected: { Country: ["Country is not supported."] },
  },
  {
    name: "postal codes follow the country's format",
    args: [{ ...valid, PostalCode: "1234" }],
    expected: { PostalCode: ["PostalCode is not valid for US."] },
  },
  {
    name: "accepts a Canadian postal code and rejects a long name",
    args: [{ ...valid, Name: "x".repeat(51), Country: "CA", PostalCode: "K1A 0B1", Age: null }],
    expected: { Name: ["Name must be at most 50 characters."], Age: ["Age is required."] },
  },
  {
    name: "a whitespace name is missing, not too long",
    args: [{ ...valid, Name: "   ", Country: "CA", PostalCode: "k1a 0b1" }],
    expected: { Name: ["Name is required."], PostalCode: ["PostalCode is not valid for CA."] },
    hidden: true,
  },
  {
    name: "rejects tricky emails",
    args: [{ ...valid, Email: "a@@b.com" }],
    expected: { Email: ["Email is not valid."] },
    hidden: true,
  },
  {
    name: "age boundaries are inclusive and GB accepts any postal text",
    args: [{ ...valid, Age: 120, Country: "GB", PostalCode: "SW1A 1AA", Email: "a@b.co" }],
    expected: {},
    hidden: true,
  },
  {
    name: "a domain ending in a dot is invalid",
    args: [{ ...valid, Age: 18, Email: "a@b.com." }],
    expected: { Email: ["Email is not valid."] },
    hidden: true,
  },
];
