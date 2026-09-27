import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/runtimes/**",
    "projects/**/bin/**",
    "projects/**/obj/**",
    "projects/**/node_modules/**",
    "projects/inventory-desk/InventoryDesk.Api/wwwroot/app.js",
    "projects/**/test-results/**",
  ]),
  {
    // Exercise starter stubs are intentionally incomplete: unused params and
    // empty bodies are the point, since the learner fills them in.
    files: ["content/**/*.starter.ts", "content/**/*.starter.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
]);

export default eslintConfig;
