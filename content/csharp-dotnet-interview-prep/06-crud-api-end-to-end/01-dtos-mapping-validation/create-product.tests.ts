import type { TestCase } from "@content/_authoring/types";

export const functionName = "Create";

const existing = ["MUG-001", "tee-blk-m"];

export const tests: TestCase[] = [
  {
    name: "normalizes a valid request and maps it to a DTO",
    args: [{ Name: "  Enamel Mug ", Sku: " mug-002", Price: 12.5, Tags: ["Kitchen", " kitchen ", "gift"] }, existing],
    expected: {
      Status: 201,
      Errors: {},
      Product: { Id: "prd_mug-002", Sku: "MUG-002", Name: "Enamel Mug", Price: 12.5, Tags: ["kitchen", "gift"] },
    },
  },
  {
    name: "collects errors per field",
    args: [{ Name: "   ", Sku: "a!", Price: 0, Tags: null }, existing],
    expected: {
      Status: 400,
      Errors: {
        Name: ["Name is required."],
        Sku: ["Sku must be 3-20 letters, digits or dashes."],
        Price: ["Price must be greater than zero."],
      },
      Product: null,
    },
  },
  {
    name: "rejects a price with more than two decimal places",
    args: [{ Name: "Sticker", Sku: "STK-1", Price: 1.999, Tags: [] }, existing],
    expected: { Status: 400, Errors: { Price: ["Price must have at most two decimal places."] }, Product: null },
  },
  {
    name: "a duplicate SKU is a 409 conflict, compared ignoring case",
    args: [{ Name: "Black Tee", Sku: "TEE-BLK-M", Price: 20, Tags: [] }, existing],
    expected: { Status: 409, Errors: { Sku: ["Sku already exists."] }, Product: null },
  },
  {
    name: "too many tags after de-duplication",
    args: [{ Name: "Poster", Sku: "PST-9", Price: 9.99, Tags: ["a", "b", "c", "d", "e", "f"] }, existing],
    expected: { Status: 400, Errors: { Tags: ["At most 5 tags are allowed."] }, Product: null },
  },
  {
    name: "fields the contract does not define (over-posting) are ignored",
    args: [{ Name: "Pin", Sku: "PIN-1", Price: 3, Tags: null, Id: "prd_admin", IsDeleted: true }, existing],
    expected: {
      Status: 201,
      Errors: {},
      Product: { Id: "prd_pin-1", Sku: "PIN-1", Name: "Pin", Price: 3, Tags: [] },
    },
    hidden: true,
  },
  {
    name: "validation runs before the conflict check",
    args: [{ Name: "", Sku: "MUG-001", Price: 5, Tags: [] }, existing],
    expected: { Status: 400, Errors: { Name: ["Name is required."] }, Product: null },
    hidden: true,
  },
  {
    name: "a missing SKU and an over-long name",
    args: [{ Name: "x".repeat(101), Sku: null, Price: 1, Tags: ["", "  "] }, existing],
    expected: {
      Status: 400,
      Errors: { Name: ["Name must be at most 100 characters."], Sku: ["Sku is required."] },
      Product: null,
    },
    hidden: true,
  },
];
