import type { TestCase } from "@content/_authoring/types";

export const functionName = "Labels";

const c = (
  Name: string | null,
  Email: string | null,
  Phone: string | null,
  Address: { City: string; Region: string | null } | null,
) => ({ Name, Email, Phone, Address });

export const tests: TestCase[] = [
  {
    name: "a complete contact",
    args: [[c("Ada Lovelace", "Ada@Example.com", null, { City: "London", Region: "England" })]],
    expected: ["Ada Lovelace <ada@example.com> - London, England"],
  },
  {
    name: "falls back to the phone when there is no email",
    args: [[c("Grace", null, " 555-0100 ", { City: "Arlington", Region: "VA" })]],
    expected: ["Grace <555-0100> - Arlington, VA"],
  },
  {
    name: "no email and no phone",
    args: [[c("Linus", null, null, { City: "Portland", Region: null })]],
    expected: ["Linus <no contact> - Portland"],
  },
  {
    name: "a null address is unknown, not a crash",
    args: [[c("Barbara", "b@example.com", null, null)]],
    expected: ["Barbara <b@example.com> - unknown location"],
  },
  {
    name: "a null name from JSON is skipped even though Name is non-nullable",
    args: [[c(null, "ghost@example.com", null, null), c("Ken", "ken@example.com", null, null)]],
    expected: ["Ken <ken@example.com> - unknown location"],
  },
  {
    name: "whitespace email counts as missing",
    args: [[c("  Margaret  ", "   ", "555-0199", { City: "Boston", Region: "  " })]],
    expected: ["Margaret <555-0199> - Boston"],
  },
  {
    name: "a blank name is skipped and an empty list stays empty",
    args: [[c("   ", "x@example.com", null, null)]],
    expected: [],
    hidden: true,
  },
  {
    name: "several contacts keep their order",
    args: [[
      c("Alan", null, null, null),
      c("Edsger", "EWD@Example.NL", "1", { City: "Austin", Region: "TX" }),
    ]],
    expected: ["Alan <no contact> - unknown location", "Edsger <ewd@example.nl> - Austin, TX"],
    hidden: true,
  },
];
