import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
await build({ absWorkingDir: root, entryPoints: ["ui/main.jsx"], bundle: true, minify: true, format: "iife", outfile: "InventoryDesk.Api/wwwroot/app.js", define: { "process.env.NODE_ENV": '"production"' } });
console.log("Built Inventory Desk React UI.");
