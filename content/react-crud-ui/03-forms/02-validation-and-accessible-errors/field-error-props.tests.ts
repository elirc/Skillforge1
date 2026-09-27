import type { TestCase } from "@content/_authoring/types";

export const functionName = "fieldErrorProps";

const clean = (field: string) => ({ id: `product-${field}`, invalid: false, describedBy: null, message: null });
const shown = (field: string, message: string) => ({
  id: `product-${field}`,
  invalid: true,
  describedBy: `product-${field}-error`,
  message,
});

const blank = { name: "", price: "", sku: "" };
const valid = { name: "Desk", price: "120.50", sku: "DSK-0001" };

export const tests: TestCase[] = [
  {
    name: "an untouched blank form shows nothing but cannot submit",
    args: [blank, [], false],
    expected: { fields: { name: clean("name"), price: clean("price"), sku: clean("sku") }, canSubmit: false },
  },
  {
    name: "touching a field reveals only its error",
    args: [blank, ["name"], false],
    expected: {
      fields: { name: shown("name", "Name is required"), price: clean("price"), sku: clean("sku") },
      canSubmit: false,
    },
  },
  {
    name: "submitting reveals every error",
    args: [blank, [], true],
    expected: {
      fields: { name: shown("name", "Name is required"), price: shown("price", "Price is required"), sku: clean("sku") },
      canSubmit: false,
    },
  },
  {
    name: "a valid form",
    args: [valid, ["name", "price", "sku"], true],
    expected: { fields: { name: clean("name"), price: clean("price"), sku: clean("sku") }, canSubmit: true },
  },
  {
    name: "price with three decimals",
    args: [{ ...valid, price: "9.999" }, ["price"], false],
    expected: {
      fields: {
        name: clean("name"),
        price: shown("price", "Price must be a number with up to 2 decimals"),
        sku: clean("sku"),
      },
      canSubmit: false,
    },
  },
  {
    name: "a lowercase SKU is invalid",
    args: [{ ...valid, sku: "dsk-0001" }, [], true],
    expected: {
      fields: { name: clean("name"), price: clean("price"), sku: shown("sku", "SKU must look like ABC-1234") },
      canSubmit: false,
    },
  },
  {
    name: "whitespace-only name is required",
    args: [{ ...valid, name: "   ", sku: "" }, ["name"], false],
    expected: {
      fields: { name: shown("name", "Name is required"), price: clean("price"), sku: clean("sku") },
      canSubmit: false,
    },
  },
  {
    name: "a 61-character name is too long",
    args: [{ ...valid, name: "x".repeat(61) }, [], true],
    expected: {
      fields: { name: shown("name", "Name must be 60 characters or fewer"), price: clean("price"), sku: clean("sku") },
      canSubmit: false,
    },
    hidden: true,
  },
  {
    name: "negative price is rejected",
    args: [{ ...valid, price: "-5" }, ["price"], false],
    expected: {
      fields: {
        name: clean("name"),
        price: shown("price", "Price must be a number with up to 2 decimals"),
        sku: clean("sku"),
      },
      canSubmit: false,
    },
    hidden: true,
  },
];
