export type ImportedUser = { name: string; email: string; role: string };
export type RowError = { line: number; errors: string[] };

const ROLES = ["admin", "editor", "viewer"];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function importUsers(csv: string): { imported: ImportedUser[]; errors: RowError[] } {
  const lines = csv.split("\n").map((line) => line.replace(/\r$/, ""));
  const header = (lines[0] ?? "").split(",").map((cell) => cell.trim().toLowerCase());
  for (const column of ["name", "email", "role"]) {
    if (!header.includes(column)) return { imported: [], errors: [{ line: 1, errors: [`missing column: ${column}`] }] };
  }
  const col = { name: header.indexOf("name"), email: header.indexOf("email"), role: header.indexOf("role") };

  const imported: ImportedUser[] = [];
  const errors: RowError[] = [];
  const seen = new Map<string, number>();

  for (let i = 1; i < lines.length; i++) {
    const line = i + 1;
    if (lines[i].trim() === "") continue;
    const cells = lines[i].split(",").map((cell) => cell.trim());
    if (cells.length !== header.length) {
      errors.push({ line, errors: [`expected ${header.length} columns, got ${cells.length}`] });
      continue;
    }
    const name = cells[col.name];
    const email = cells[col.email].toLowerCase();
    const role = cells[col.role].toLowerCase() || "viewer";
    const problems: string[] = [];
    if (!name) problems.push("name is required");
    const emailValid = EMAIL.test(email);
    if (!emailValid) problems.push("email is invalid");
    if (!ROLES.includes(role)) problems.push("role must be admin, editor or viewer");
    if (emailValid && seen.has(email)) problems.push(`duplicate email (first seen on line ${seen.get(email)})`);

    if (problems.length > 0) {
      errors.push({ line, errors: problems });
    } else {
      seen.set(email, line);
      imported.push({ name, email, role });
    }
  }
  return { imported, errors };
}
