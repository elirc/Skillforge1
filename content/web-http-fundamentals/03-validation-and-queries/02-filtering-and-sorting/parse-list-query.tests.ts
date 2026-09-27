import type { TestCase } from "@content/_authoring/types";

export const functionName = "parseListQuery";

const ID_ASC = { field: "id", direction: "asc" };

export const tests: TestCase[] = [
  {
    name: "an empty query uses the defaults",
    args: [""],
    expected: { ok: true, filters: {}, sort: [ID_ASC], page: 1, pageSize: 20 },
  },
  {
    name: "parses filters, sort, and paging",
    args: ["?status=active&search=desk+lamp&sort=-price,name&page=2&pageSize=50"],
    expected: {
      ok: true,
      filters: { status: "active", search: "desk lamp" },
      sort: [{ field: "price", direction: "desc" }, { field: "name", direction: "asc" }, ID_ASC],
      page: 2,
      pageSize: 50,
    },
  },
  {
    name: "caps pageSize at 100",
    args: ["pageSize=5000"],
    expected: { ok: true, filters: {}, sort: [ID_ASC], page: 1, pageSize: 100 },
  },
  {
    name: "rejects a sort field that is not allow-listed",
    args: ["sort=passwordHash"],
    expected: { ok: false, errors: ["Cannot sort by 'passwordHash'."] },
  },
  {
    name: "rejects an unknown status",
    args: ["status=deleted"],
    expected: { ok: false, errors: ["Invalid status 'deleted'."] },
  },
  {
    name: "collects errors in parameter order",
    args: ["page=0&sort=-rating&pageSize=ten"],
    expected: { ok: false, errors: ["page must be a positive integer.", "Cannot sort by 'rating'.", "pageSize must be a positive integer."] },
  },
  {
    name: "does not add id twice and ignores unknown parameters",
    args: ["sort=-id&utm_source=mail&search=%20%20"],
    expected: { ok: true, filters: {}, sort: [{ field: "id", direction: "desc" }], page: 1, pageSize: 20 },
  },
  {
    name: "decodes percent-encoded values",
    args: ["search=caf%C3%A9%20chairs&sort=createdAt"],
    expected: { ok: true, filters: { search: "café chairs" }, sort: [{ field: "createdAt", direction: "asc" }, ID_ASC], page: 1, pageSize: 20 },
    hidden: true,
  },
  {
    name: "a negative page is invalid",
    args: ["page=-3"],
    expected: { ok: false, errors: ["page must be a positive integer."] },
    hidden: true,
  },
];
