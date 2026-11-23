export type AuthMode = 'sign-in' | 'sign-up';
export type AuthInputResult = { ok: true; email: string; password: string } | { ok: false; message: string };
export function validateRecoveryEmail(email: string): { ok: true; email: string } | { ok: false; message: string } {
  const normalized = email.trim();
  if (normalized.length > 254 || normalized.length < 6 || /[\s\x00-\x1f\x7f]/.test(normalized) || !/^[^@]+@[^@.]+\.[^@.]+$/.test(normalized)) return { ok: false, message: 'Enter a valid email address.' };
  return { ok: true, email: normalized };
}
export function validateAuthInput(email: string, password: string, mode: AuthMode): AuthInputResult {
  if (mode !== 'sign-in' && mode !== 'sign-up') return { ok: false, message: 'Invalid authentication mode.' };
  const checked = validateRecoveryEmail(email);
  if (!checked.ok) return checked;
  if (password.length < (mode === 'sign-up' ? 6 : 1) || password.length > 1024) return { ok: false, message: 'Password length is invalid.' };
  return { ok: true, email: checked.email, password };
}
