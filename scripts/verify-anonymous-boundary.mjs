#!/usr/bin/env node
/** Black-box Phase 1 security probe. Uses ONLY a publishable key, never a user token. */
export function validatePublicConfig(url, key) {
  if (typeof url !== 'string' || typeof key !== 'string' || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return null;
  if (url !== url.trim() || key !== key.trim()) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(parsed.hostname) ||
        parsed.pathname !== '/' || parsed.port || parsed.username || parsed.password || parsed.search || parsed.hash) return null;
    return parsed.origin;
  } catch { return null; }
}
export async function probeAnonymousBoundary({ url, key, fetchImpl = fetch, timeoutMs = 8000 }) {
  const origin = validatePublicConfig(url, key);
  if (!origin) return { status: 'blocked', reason: 'Invalid public project configuration' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${origin}/rest/v1/profiles?select=id&limit=1`, {
      method: 'GET', headers: { apikey: key, Accept: 'application/json' },
      signal: controller.signal, redirect: 'error',
    });
    if (response.status === 401 || response.status === 403) return { status: 'passed', httpStatus: response.status };
    return { status: 'failed', httpStatus: response.status, reason: response.ok ? 'Anonymous profile read was accepted' : 'Unexpected API response' };
  } catch {
    return { status: 'blocked', reason: 'Network unavailable or request timed out' };
  } finally { clearTimeout(timer); }
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const result = await probeAnonymousBoundary({
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    key: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  });
  // Deliberately print no URLs, tokens, bodies, emails, or personal data.
  console.log(JSON.stringify(result));
  process.exitCode = result.status === 'passed' ? 0 : result.status === 'blocked' ? 2 : 1;
}
