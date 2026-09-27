import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

// Written once into source files. Renaming/moving a directory never changes an
// existing ID. Do not run a positional ID generator during normal seeding.
const root = path.resolve("content");
const identity = value => "sf_" + createHash("sha256").update(value).digest("hex").slice(0, 24);
let changed = 0;
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!["module.json", "lesson.json"].includes(entry.name)) continue;
    const original = JSON.parse(await readFile(file, "utf8"));
    const data = { ...original, id: original.id ?? identity(path.relative(root, file).replaceAll("\\", "/")) };
    if (data.knowledgeItems) data.knowledgeItems = data.knowledgeItems.map((item, index) => ({ ...item, id: item.id ?? identity(data.id + "/item/" + index) }));
    if (JSON.stringify(data) !== JSON.stringify(original)) { await writeFile(file, JSON.stringify(data, null, 2) + "\n"); changed++; }
  }
}
await walk(root);
console.log(`Assigned immutable content IDs in ${changed} files.`);
