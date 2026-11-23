export function validatePasswordConfirmation(password: string, confirmation: string): string | null {
  if (password.length < 8) return 'Password must contain at least 8 characters.';
  if (password.length > 1024) return 'Password is too long.';
  if (password !== confirmation) return 'Passwords do not match.';
  return null;
}
