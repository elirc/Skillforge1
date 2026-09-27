import type { TestCase } from "@content/_authoring/types";

export const functionName = "validateCreateProduct";

const JSON_TYPE = "application/json";

export const tests: TestCase[] = [
  {
    name: "a valid body is 201 with the cleaned product",
    args: [{ contentType: JSON_TYPE, body: '{"name":"  Desk Lamp ","price":29.5,"sku":"LMP-0042"}' }],
    expected: { status: 201, product: { name: "Desk Lamp", price: 29.5, sku: "LMP-0042" } },
  },
  {
    name: "a form post is 415 Unsupported Media Type",
    args: [{ contentType: "application/x-www-form-urlencoded", body: "name=Lamp" }],
    expected: { status: 415 },
  },
  {
    name: "broken JSON is 400 Malformed JSON",
    args: [{ contentType: JSON_TYPE, body: '{"name":"Lamp",' }],
    expected: { status: 400, title: "Malformed JSON" },
  },
  {
    name: "an array body is rejected",
    args: [{ contentType: JSON_TYPE, body: '[{"name":"Lamp"}]' }],
    expected: { status: 400, title: "Body must be a JSON object" },
  },
  {
    name: "reports every invalid field at once",
    args: [{ contentType: JSON_TYPE, body: '{"name":"   ","price":0,"sku":"lmp-42"}' }],
    expected: {
      status: 400,
      title: "One or more validation errors occurred.",
      errors: {
        name: ["Name is required."],
        price: ["Price must be a positive number."],
        sku: ["SKU must look like ABC-1234."],
      },
    },
  },
  {
    name: "a price sent as a string is invalid",
    args: [{ contentType: "Application/JSON; charset=utf-8", body: '{"name":"Mug","price":"9.99","sku":"MUG-0001"}' }],
    expected: { status: 400, title: "One or more validation errors occurred.", errors: { price: ["Price must be a positive number."] } },
  },
  {
    name: "extra fields are ignored (no over-posting)",
    args: [{ contentType: JSON_TYPE, body: '{"name":"Mug","price":5,"sku":"MUG-0001","isAdmin":true,"id":99}' }],
    expected: { status: 201, product: { name: "Mug", price: 5, sku: "MUG-0001" } },
  },
  {
    name: "a 101-character name is too long",
    args: [{ contentType: JSON_TYPE, body: JSON.stringify({ name: "x".repeat(101), price: 1, sku: "ABC-1234" }) }],
    expected: { status: 400, title: "One or more validation errors occurred.", errors: { name: ["Name must be at most 100 characters."] } },
    hidden: true,
  },
  {
    name: "a JSON null body is not an object",
    args: [{ contentType: JSON_TYPE, body: "null" }],
    expected: { status: 400, title: "Body must be a JSON object" },
    hidden: true,
  },
];
