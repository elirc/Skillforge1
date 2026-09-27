export function evaluateFormula(formula: string, vars: Record<string, number>) {
  // 1. Tokenize into numbers, identifiers, operators and parentheses.
  // 2. Parse with one function per precedence level (+-, then */, then unary/primary).
  // 3. Return null for syntax errors, unknown variables, or division by zero.
}
