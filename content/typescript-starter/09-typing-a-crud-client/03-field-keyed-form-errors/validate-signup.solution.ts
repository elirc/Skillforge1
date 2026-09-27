interface SignupForm {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  age: string;
}

type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup(form: SignupForm): FieldErrors<SignupForm> {
  const errors: FieldErrors<SignupForm> = {};

  const email = form.email.trim();
  if (email === "") errors.email = "Email is required";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email";

  const nameLength = form.displayName.trim().length;
  if (nameLength < 2 || nameLength > 30) errors.displayName = "Display name must be 2-30 characters";

  if (form.password.length < 8) errors.password = "Password must be at least 8 characters";
  else if (!/\d/.test(form.password)) errors.password = "Password must contain a number";

  if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match";

  const age = form.age.trim();
  if (age !== "") {
    const value = Number(age);
    if (!/^\d+$/.test(age) || value < 13 || value > 120) {
      errors.age = "Age must be a whole number from 13 to 120";
    }
  }

  return errors;
}
