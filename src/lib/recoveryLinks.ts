export const RECOVERY_REDIRECT_URL = 'socialeyes://auth/recover';
export type RecoveryLink = { tokenHash: string; type: 'recovery' };
/** Accept only exact app-scheme OTP links; never accept bearer tokens in URLs. */
export function parseRecoveryLink(input: string): RecoveryLink | null {
  if (typeof input !== 'string' || !input.startsWith(RECOVERY_REDIRECT_URL + '?')) return null;
  if (/\s|\\|#|@|%/.test(input)) return null;
  const query = input.slice(RECOVERY_REDIRECT_URL.length + 1);
  const pairs = query.split('&');
  if (pairs.length !== 2) return null;
  const fields = new Map<string, string>();
  for (const pair of pairs) {
    const segments = pair.split('=');
    if (segments.length !== 2 || fields.has(segments[0])) return null;
    fields.set(segments[0], segments[1]);
  }
  const tokenHash = fields.get('token_hash');
  if (fields.get('type') !== 'recovery' || !tokenHash || !/^[a-fA-F0-9]{64}$/.test(tokenHash)) return null;
  return { tokenHash, type: 'recovery' };
}
