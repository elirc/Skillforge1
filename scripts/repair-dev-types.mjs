import { readFile, writeFile } from "node:fs/promises";
// Restore corrupt generated development types from freshly generated build
// types. Only the import depth changes; authored application files are untouched.
for (const filename of ["routes.d.ts", "validator.ts"]) {
  const source = await readFile(`.next/types/${filename}`, "utf8");
  await writeFile(`.next/dev/types/${filename}`, source.replaceAll('"../../src/', '"../../../src/'));
}
