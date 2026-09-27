import type { TestCase } from "@content/_authoring/types";

export const functionName = "submitMachine";

export const tests: TestCase[] = [
  {
    name: "while submitting the button is disabled",
    args: [[{ type: "submit" }]],
    expected: { status: "submitting", disabled: true, submitCount: 1, fieldErrors: {}, formError: null, savedId: null },
  },
  {
    name: "a double click sends only once",
    args: [[{ type: "submit" }, { type: "submit" }, { type: "success", id: 7 }]],
    expected: { status: "success", disabled: false, submitCount: 1, fieldErrors: {}, formError: null, savedId: 7 },
  },
  {
    name: "a 422 maps server errors onto fields",
    args: [[{ type: "submit" }, { type: "failure", status: 422, fieldErrors: { sku: "SKU already exists" } }]],
    expected: {
      status: "error",
      disabled: false,
      submitCount: 1,
      fieldErrors: { sku: "SKU already exists" },
      formError: null,
      savedId: null,
    },
  },
  {
    name: "a 500 shows a generic form error",
    args: [[{ type: "submit" }, { type: "failure", status: 503, message: "upstream timeout" }]],
    expected: {
      status: "error",
      disabled: false,
      submitCount: 1,
      fieldErrors: {},
      formError: "Something went wrong. Try again.",
      savedId: null,
    },
  },
  {
    name: "a 409 shows the server message",
    args: [[{ type: "submit" }, { type: "failure", status: 409, message: "Someone else edited this product" }]],
    expected: {
      status: "error",
      disabled: false,
      submitCount: 1,
      fieldErrors: {},
      formError: "Someone else edited this product",
      savedId: null,
    },
  },
  {
    name: "editing a field clears only that field's server error",
    args: [
      [
        { type: "submit" },
        { type: "failure", status: 422, fieldErrors: { sku: "Taken", name: "Too similar" } },
        { type: "edit", field: "sku" },
      ],
    ],
    expected: {
      status: "error",
      disabled: false,
      submitCount: 1,
      fieldErrors: { name: "Too similar" },
      formError: null,
      savedId: null,
    },
  },
  {
    name: "resubmitting clears old errors",
    args: [
      [
        { type: "submit" },
        { type: "failure", status: 500 },
        { type: "submit" },
        { type: "success", id: 3 },
      ],
    ],
    expected: { status: "success", disabled: false, submitCount: 2, fieldErrors: {}, formError: null, savedId: 3 },
  },
  {
    name: "a response when nothing is in flight is ignored",
    args: [[{ type: "success", id: 99 }, { type: "failure", status: 500 }]],
    expected: { status: "idle", disabled: false, submitCount: 0, fieldErrors: {}, formError: null, savedId: null },
    hidden: true,
  },
  {
    name: "editing after success returns to idle; unknown status without message",
    args: [
      [
        { type: "submit" },
        { type: "success", id: 1 },
        { type: "edit", field: "name" },
        { type: "submit" },
        { type: "failure", status: 404 },
      ],
    ],
    expected: {
      status: "error",
      disabled: false,
      submitCount: 2,
      fieldErrors: {},
      formError: "Request failed (404)",
      savedId: 1,
    },
    hidden: true,
  },
];
