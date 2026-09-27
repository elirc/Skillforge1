// SELECT name FROM products
// WHERE name LIKE @pattern ESCAPE '\'      -- case-insensitive collation (e.g. SQL_Latin1_General_CP1_CI_AS)
//
// %  matches any run of characters (including none)
// _  matches exactly one character
// \% and \_ match a literal % or _
export function likeFilter(names: string[], pattern: string): string[] {
  // Translate the pattern into an anchored, case-insensitive RegExp.
  // Escape every character that means something special in a regex.
  return names.filter((name) => name === pattern);
}
