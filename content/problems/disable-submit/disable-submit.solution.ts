type LoginForm = { email: string; password: string };

export function disableSubmit(form: LoginForm, saving: boolean): boolean {
  return saving || form.email.length === 0 || form.password.length === 0;
}
