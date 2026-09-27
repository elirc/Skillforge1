export type FlagUser = Record<string, string | number | boolean>;

export function evaluateRule(rule: string, user: FlagUser) {
  // 1. Tokenize: >=, <=, !=, =, >, <, (, ), [, ], ",", words, and any other single character.
  // 2. Recursive descent: or -> and -> not -> primary (group or comparison).
  // 3. Leftover tokens are an error. Return { ok, value } or { ok: false, error }.
}
