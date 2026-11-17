#!/usr/bin/env node
/** Read-only RLS probe. No credentials or response bodies are printed. */
import { pathToFileURL } from 'node:url';

export const REQUIRED = ['SOCIAL_EYES_TEST_URL', 'SOCIAL_EYES_TEST_ANON_KEY', 'SOCIAL_EYES_TEST_USER_A_TOKEN', 'SOCIAL_EYES_TEST_USER_B_TOKEN'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateConfig(env) {
  const missing = REQUIRED.filter(name => !env[name]?.trim());
  if (missing.length) return { missing };
  let url;
  try { url = new URL(env.SOCIAL_EYES_TEST_URL); }
  catch { throw Error('Use a valid HTTPS Supabase origin'); }
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw Error('Use a clean HTTPS Supabase origin');
  const key = env.SOCIAL_EYES_TEST_ANON_KEY;
  if (key !== key.trim() || /[\r\n]/.test(key) || /^sb_(?:secret|service_role)_/i.test(key)) throw Error('Never supply a secret/service-role key');
  for (const token of [env.SOCIAL_EYES_TEST_USER_A_TOKEN, env.SOCIAL_EYES_TEST_USER_B_TOKEN]) {
    if (token !== token.trim() || /[\s\x00-\x1f\x7f]/.test(token)) throw Error('Tokens must not contain whitespace or control characters');
  }
  if (env.SOCIAL_EYES_TEST_USER_A_TOKEN === env.SOCIAL_EYES_TEST_USER_B_TOKEN) throw Error('Distinct user tokens required');
  return { origin: url.origin, key, aToken: env.SOCIAL_EYES_TEST_USER_A_TOKEN, bToken: env.SOCIAL_EYES_TEST_USER_B_TOKEN };
}

export async function verifyTwoUserProfiles(config, fetcher = fetch, logger = console) {
  const { origin, key, aToken, bToken } = config;
  async function get(path, token) {
    const headers = { apikey: key, Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetcher(`${origin}${path}`, { method: 'GET', headers, signal: AbortSignal.timeout(10000), redirect: 'error' });
    if (!response.ok) {
      // Never echo response bodies: upstream errors can include sensitive details.
      if (!token && [401, 403].includes(response.status)) return { denied: true };
      throw Error(`Unexpected HTTP ${response.status} for ${path.split('?')[0]}`);
    }
    try { return await response.json(); }
    catch { throw Error('Invalid JSON from backend'); }
  }
  const a = await get('/auth/v1/user', aToken);
  const b = await get('/auth/v1/user', bToken);
  if (!UUID.test(a?.id) || !UUID.test(b?.id) || a.id === b.id) throw Error('Tokens must belong to distinct valid users');
  for (const [label, token, own, other] of [['A', aToken, a.id, b.id], ['B', bToken, b.id, a.id]]) {
    const ownRows = await get(`/rest/v1/profiles?select=id&id=eq.${own}`, token);
    const otherRows = await get(`/rest/v1/profiles?select=id&id=eq.${other}`, token);
    if (!Array.isArray(ownRows) || ownRows.length !== 1 || ownRows[0]?.id !== own) throw Error(`User ${label} must have one seeded own profile`);
    if (!Array.isArray(otherRows) || otherRows.length !== 0) throw Error(`SECURITY FAILURE: user ${label} can read another profile`);
    logger.log(`PASS: user ${label} can read own profile, cannot read other profile`);
  }
  const anonymousRows = await get('/rest/v1/profiles?select=id&limit=1');
  if (!anonymousRows?.denied && (!Array.isArray(anonymousRows) || anonymousRows.length)) throw Error('SECURITY FAILURE: anonymous request exposed profiles');
  logger.log('PASS: anonymous profile reads reveal no rows');
  logger.log('PASS: read-only live two-user profile checks');
}

export async function run(env = process.env, fetcher = fetch, logger = console) {
  try {
    const config = validateConfig(env);
    if (config.missing) {
      logger.error(`NOT RUN: missing ${config.missing.join(', ')}. See docs/LIVE_BACKEND_VERIFICATION.md`);
      return 2;
    }
    await verifyTwoUserProfiles(config, fetcher, logger);
    return 0;
  } catch (error) {
    logger.error(`FAIL: ${error instanceof Error ? error.message : 'Unknown verification error'}`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await run();
}
