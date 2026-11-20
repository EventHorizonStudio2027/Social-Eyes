/** Validate a password and its exact confirmation without altering either secret. */
export function validatePasswordConfirmation(password: string, confirmation: string): { ok: true } | { ok: false; message: string } {
  if (password.length < 8) return { ok: false, message: 'Use at least 8 characters.' };
  if (password.length > 1024) return { ok: false, message: 'Password is too long.' };
  if (password !== confirmation) return { ok: false, message: 'Passwords do not match.' };
  return { ok: true };
}
