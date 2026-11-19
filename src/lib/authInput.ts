export type AuthMode = 'sign-in' | 'sign-up';
export type AuthInputResult = { ok: true; email: string; password: string } | { ok: false; message: string };
export function validateAuthInput(email: string, password: string, mode: AuthMode): AuthInputResult {
  if (mode !== 'sign-in' && mode !== 'sign-up') return { ok: false, message: 'Invalid authentication mode.' };
  const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (normalized.length > 254 || !/^[^\\s@\\x00-\\x1f\\x7f]+@[^\\s@\\x00-\\x1f\\x7f]+\\.[^\\s@\\x00-\\x1f\\x7f]+$/.test(normalized)) return { ok: false, message: 'Enter a valid email address.' };
  if (typeof password !== 'string' || password.length < 6 || password.length > 1024) return { ok: false, message: 'Invalid password length.' };
  return { ok: true, email: normalized, password };
}
/** Validate a recovery email without disclosing whether the account exists. */
export function validateRecoveryEmail(email: string): { ok: true; email: string } | { ok: false; message: string } {
  if (typeof email !== 'string') return { ok: false, message: 'Enter a valid email address.' };
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254 || !/^[^\s@\x00-\x1f\x7f]+@[^\s@\x00-\x1f\x7f]+\.[^\s@\x00-\x1f\x7f]+$/.test(normalized))
    return { ok: false, message: 'Enter a valid email address.' };
  return { ok: true, email: normalized };
}
