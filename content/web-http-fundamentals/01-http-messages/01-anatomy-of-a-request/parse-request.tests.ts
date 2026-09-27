import type { TestCase } from "@content/_authoring/types";

export const functionName = "parseRequest";

export const tests: TestCase[] = [
  {
    name: "a GET with no query and no body",
    args: ["GET /products HTTP/1.1\r\nHost: shop.test\r\n\r\n"],
    expected: { method: "GET", path: "/products", query: {}, headers: { host: "shop.test" }, body: "" },
  },
  {
    name: "splits and decodes the query string",
    args: ["GET /products?page=2&q=desk%20lamp HTTP/1.1\r\nHost: shop.test\r\n\r\n"],
    expected: { method: "GET", path: "/products", query: { page: "2", q: "desk lamp" }, headers: { host: "shop.test" }, body: "" },
  },
  {
    name: "lowercases header names and trims values",
    args: ["GET / HTTP/1.1\r\nHost: api.test\r\nContent-Type:   application/json  \r\nX-Request-Id: abc\r\n\r\n"],
    expected: {
      method: "GET",
      path: "/",
      query: {},
      headers: { host: "api.test", "content-type": "application/json", "x-request-id": "abc" },
      body: "",
    },
  },
  {
    name: "keeps the body of a POST",
    args: ['POST /orders HTTP/1.1\r\nContent-Type: application/json\r\nContent-Length: 13\r\n\r\n{"sku":"A-1"}'],
    expected: {
      method: "POST",
      path: "/orders",
      query: {},
      headers: { "content-type": "application/json", "content-length": "13" },
      body: '{"sku":"A-1"}',
    },
  },
  {
    name: "joins repeated headers with a comma",
    args: ["GET / HTTP/1.1\r\nAccept: text/html\r\naccept: application/json\r\n\r\n"],
    expected: { method: "GET", path: "/", query: {}, headers: { accept: "text/html, application/json" }, body: "" },
  },
  {
    name: "a query key without = gets an empty string",
    args: ["DELETE /carts/7?force HTTP/1.1\r\nHost: shop.test\r\n\r\n"],
    expected: { method: "DELETE", path: "/carts/7", query: { force: "" }, headers: { host: "shop.test" }, body: "" },
  },
  {
    name: "uppercases the method and keeps colons inside header values",
    args: ["patch /users/3 HTTP/1.1\r\nReferer: https://app.test:8443/users\r\n\r\n{}"],
    expected: { method: "PATCH", path: "/users/3", query: {}, headers: { referer: "https://app.test:8443/users" }, body: "{}" },
    hidden: true,
  },
  {
    name: "the body may itself contain blank lines",
    args: ["POST /notes?tag=a&tag=b HTTP/1.1\r\nHost: x\r\n\r\nline 1\r\n\r\nline 3"],
    expected: { method: "POST", path: "/notes", query: { tag: "b" }, headers: { host: "x" }, body: "line 1\r\n\r\nline 3" },
    hidden: true,
  },
];
