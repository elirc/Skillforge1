interface SignupForm {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  age: string; // optional field: "" when left blank
}

// One optional message per form field. Because the keys come from keyof
// SignupForm, errors.emial would be a compile error.
type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validateSignup(form: SignupForm) {
  // Check fields in this order and record at most one message per field
  // (the first rule it breaks). Return {} when everything is valid.
  // email (trimmed): "" -> "Email is required"
  //                  not like x@y.z (no spaces) -> "Enter a valid email"
  // displayName:     trimmed length not 2..30 -> "Display name must be 2-30 characters"
  // password:        shorter than 8 -> "Password must be at least 8 characters"
  //                  no digit -> "Password must contain a number"
  // confirmPassword: differs from password -> "Passwords do not match"
  // age:             "" is fine; otherwise must be a whole number 13..120
  //                  -> "Age must be a whole number from 13 to 120"
}
