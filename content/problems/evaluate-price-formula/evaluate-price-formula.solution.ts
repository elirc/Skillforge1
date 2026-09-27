export function evaluateFormula(formula: string, vars: Record<string, number>): number | null {
  class FormulaError extends Error {}

  const tokens: string[] = [];
  const tokenPattern = /\s*(\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_]*|[-+*/()])/y;
  let index = 0;
  while (index < formula.length) {
    if (/^\s*$/.test(formula.slice(index))) break;
    tokenPattern.lastIndex = index;
    const match = tokenPattern.exec(formula);
    if (!match) return null;
    tokens.push(match[1]);
    index = tokenPattern.lastIndex;
  }

  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];

  function parseExpression(): number {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = take();
      const right = parseTerm();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }

  function parseTerm(): number {
    let value = parseUnary();
    while (peek() === "*" || peek() === "/") {
      const op = take();
      const right = parseUnary();
      if (op === "/" && right === 0) throw new FormulaError("division by zero");
      value = op === "*" ? value * right : value / right;
    }
    return value;
  }

  function parseUnary(): number {
    if (peek() === "-") {
      take();
      return -parseUnary();
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    const token = take();
    if (token === undefined) throw new FormulaError("unexpected end");
    if (token === "(") {
      const value = parseExpression();
      if (take() !== ")") throw new FormulaError("missing )");
      return value;
    }
    if (/^\d/.test(token)) return Number(token);
    if (/^[A-Za-z_]/.test(token)) {
      if (!Object.prototype.hasOwnProperty.call(vars, token)) throw new FormulaError(`unknown ${token}`);
      return vars[token];
    }
    throw new FormulaError(`unexpected ${token}`);
  }

  try {
    const result = parseExpression();
    return position === tokens.length ? result : null;
  } catch (error) {
    if (error instanceof FormulaError) return null;
    throw error;
  }
}
