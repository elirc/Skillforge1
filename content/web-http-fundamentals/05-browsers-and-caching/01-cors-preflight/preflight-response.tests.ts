import type { TestCase } from "@content/_authoring/types";

export const functionName = "preflightResponse";

const policy = {
  allowedOrigins: ["https://app.test", "https://admin.app.test"],
  allowedMethods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  allowCredentials: true,
  maxAgeSeconds: 600,
};

const publicPolicy = {
  allowedOrigins: ["*"],
  allowedMethods: ["GET"],
  allowedHeaders: [],
  allowCredentials: false,
  maxAgeSeconds: 86400,
};

export const tests: TestCase[] = [
  {
    name: "allows a listed origin, method, and headers",
    args: [policy, { origin: "https://app.test", "access-control-request-method": "PUT", "access-control-request-headers": "Content-Type, Authorization" }],
    expected: {
      allowed: true,
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://app.test",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
        "Access-Control-Allow-Headers": "content-type, authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "600",
        Vary: "Origin",
      },
    },
  },
  {
    name: "rejects an unknown origin",
    args: [policy, { origin: "https://evil.test", "access-control-request-method": "DELETE" }],
    expected: { allowed: false, reason: "Origin not allowed" },
  },
  {
    name: "origins must match exactly, including the scheme",
    args: [policy, { origin: "http://app.test", "access-control-request-method": "GET" }],
    expected: { allowed: false, reason: "Origin not allowed" },
  },
  {
    name: "rejects a method that is not listed",
    args: [policy, { origin: "https://app.test", "access-control-request-method": "PATCH" }],
    expected: { allowed: false, reason: "Method not allowed" },
  },
  {
    name: "rejects the first header that is not listed",
    args: [policy, { origin: "https://app.test", "access-control-request-method": "POST", "access-control-request-headers": "content-type,x-debug,x-other" }],
    expected: { allowed: false, reason: "Header 'x-debug' not allowed" },
  },
  {
    name: "a public API answers with * and no Vary",
    args: [publicPolicy, { origin: "https://anyone.test", "access-control-request-method": "GET" }],
    expected: {
      allowed: true,
      status: 204,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET", "Access-Control-Max-Age": "86400" },
    },
  },
  {
    name: "* with credentials is a configuration error",
    args: [{ ...publicPolicy, allowCredentials: true }, { origin: "https://anyone.test", "access-control-request-method": "GET" }],
    expected: { allowed: false, reason: "Wildcard origin cannot be combined with credentials" },
  },
  {
    name: "method names are compared case-insensitively",
    args: [policy, { origin: "https://admin.app.test", "access-control-request-method": "delete" }],
    expected: {
      allowed: true,
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://admin.app.test",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "600",
        Vary: "Origin",
      },
    },
    hidden: true,
  },
  {
    name: "an empty header list requests no headers",
    args: [publicPolicy, { origin: "https://x.test", "access-control-request-method": "GET", "access-control-request-headers": " , " }],
    expected: {
      allowed: true,
      status: 204,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET", "Access-Control-Max-Age": "86400" },
    },
    hidden: true,
  },
];
