/** Validate a recovery email without disclosing whether the account exists. */
export function validateRecoveryEmail(email: string): { ok: true; email: string } | { ok: false; message: string } {
  if (typeof email !== 'string') return { ok: false, message: 'Enter a valid email address.' };
  const normalized = email.trim().toLowerCase();
  if (normalized.length > 254 || !/^[^\s@\x00-\x1f\x7f]+@[^\s@\x00-\x1f\x7f]+\.[^\s@\x00-\x1f\x7f]+$/.test(normalized))
    return { ok: false, message: 'Enter a valid email address.' };
  return { ok: true, email: normalized };
}
