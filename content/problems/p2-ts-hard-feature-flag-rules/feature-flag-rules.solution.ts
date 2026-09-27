export type FlagUser = Record<string, string | number | boolean>;

const TOKEN = /\s*(>=|<=|!=|=|>|<|\(|\)|\[|\]|,|[A-Za-z0-9_.-]+|\S)/y;
const WORD = /^[A-Za-z0-9_.-]+$/;

function tokenize(rule: string): string[] {
  const tokens: string[] = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < rule.length) {
    const match = TOKEN.exec(rule);
    if (!match) break;
    tokens.push(match[1]);
  }
  return tokens;
}

export function evaluateRule(rule: string, user: FlagUser): { ok: true; value: boolean } | { ok: false; error: string } {
  const tokens = tokenize(rule);
  let pos = 0;
  const fail = (token: string | undefined): never => {
    throw new Error(token === undefined ? "unexpected end of rule" : `unexpected "${token}"`);
  };
  const next = () => tokens[pos++];
  const isKeyword = (word: string) => tokens[pos]?.toLowerCase() === word;
  const expect = (want: string) => {
    const token = next();
    if (token !== want) fail(token);
  };
  const value = () => {
    const token = next();
    if (token === undefined || !WORD.test(token)) fail(token);
    return token;
  };

  const parsePrimary = (): boolean => {
    const token = next();
    if (token === undefined) return fail(token);
    if (token === "(") {
      const inner = parseOr();
      expect(")");
      return inner;
    }
    if (!WORD.test(token)) return fail(token);
    const has = Object.prototype.hasOwnProperty.call(user, token);
    const actual = user[token];
    const op = next();
    if (op === undefined) return fail(op);
    if (op.toLowerCase() === "in") {
      expect("[");
      const options = [value()];
      while (tokens[pos] === ",") {
        pos++;
        options.push(value());
      }
      expect("]");
      return has && options.includes(String(actual));
    }
    if (op === "=" || op === "!=") {
      const text = value();
      return has && (op === "=" ? String(actual) === text : String(actual) !== text);
    }
    if (op === ">=" || op === "<=" || op === ">" || op === "<") {
      const right = Number(value());
      const left = Number(actual);
      if (!has) return false;
      if (op === ">=") return left >= right;
      if (op === "<=") return left <= right;
      return op === ">" ? left > right : left < right;
    }
    return fail(op);
  };
  const parseNot = (): boolean => {
    if (isKeyword("not")) {
      pos++;
      return !parseNot();
    }
    return parsePrimary();
  };
  const parseAnd = (): boolean => {
    let result = parseNot();
    while (isKeyword("and")) {
      pos++;
      const right = parseNot();
      result = result && right;
    }
    return result;
  };
  function parseOr(): boolean {
    let result = parseAnd();
    while (isKeyword("or")) {
      pos++;
      const right = parseAnd();
      result = result || right;
    }
    return result;
  }

  try {
    const result = parseOr();
    if (pos < tokens.length) fail(tokens[pos]);
    return { ok: true, value: result };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
