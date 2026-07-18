type SignupInput = { email: string; password: string };

export function validateSignup(input: SignupInput): string[] {
  const errors: string[] = [];
  if (!input.email.includes("@")) errors.push("Email must contain @");
  if (input.password.length < 8) errors.push("Password must be at least 8 characters");
  return errors;
}
