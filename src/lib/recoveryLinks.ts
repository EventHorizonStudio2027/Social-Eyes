export const RECOVERY_REDIRECT_URL = 'socialeyes://auth/recover';
export function parseRecoveryLink(value: string): { tokenHash: string; type: 'recovery' } | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'socialeyes:' || url.hostname !== 'auth' || url.pathname !== '/recover' || url.hash || url.username || url.password || url.port) return null;
    const params = [...url.searchParams.entries()];
    if (params.length !== 2 || url.searchParams.getAll('token_hash').length !== 1 || url.searchParams.getAll('type').length !== 1 || url.searchParams.get('type') !== 'recovery') return null;
    const tokenHash = url.searchParams.get('token_hash');
    if (!tokenHash || !/^[a-fA-F0-9]{64}$/.test(tokenHash)) return null;
    return { tokenHash, type: 'recovery' };
  } catch { return null; }
}
