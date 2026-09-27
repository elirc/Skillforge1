// SELECT name FROM products
// WHERE name LIKE @pattern ESCAPE '\'      -- case-insensitive collation (e.g. SQL_Latin1_General_CP1_CI_AS)
//
// %  matches any run of characters (including none)
// _  matches exactly one character
// \% and \_ match a literal % or _
export function likeFilter(names: string[], pattern: string): string[] {
  let source = "";
  for (let i = 0; i < pattern.length; i += 1) {
    const ch = pattern[i];
    if (ch === "\\" && i + 1 < pattern.length) {
      i += 1;
      source += escapeRegex(pattern[i]);
    } else if (ch === "%") {
      source += "[\\s\\S]*";
    } else if (ch === "_") {
      source += "[\\s\\S]";
    } else {
      source += escapeRegex(ch);
    }
  }
  // LIKE must match the WHOLE value, so anchor both ends. "i" models a CI collation.
  const regex = new RegExp(`^${source}$`, "i");
  return names.filter((name) => regex.test(name));
}

function escapeRegex(ch: string): string {
  return ch.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}
