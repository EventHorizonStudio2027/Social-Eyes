import { isBackendConfigured, isSafePublicBackendConfig } from '@/lib/supabase';

export type BackendStatus = 'unconfigured' | 'checking' | 'reachable' | 'unreachable' | 'paused';
/** Public health endpoint only: a 200 response does not verify auth or RLS. */
export async function checkBackendHealth(): Promise<BackendStatus> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!isBackendConfigured || !isSafePublicBackendConfig(url, key)) return 'unconfigured';
  let endpoint: URL;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.port) return 'unconfigured';
    endpoint = new URL('/auth/v1/health', parsed);
  } catch { return 'unconfigured'; }
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<BackendStatus>(resolve => {
    timer = setTimeout(() => { controller.abort(); resolve('unreachable'); }, 6000);
  });
  const request: Promise<BackendStatus> = fetch(endpoint.toString(), { method: 'GET', headers: { apikey: key }, signal: controller.signal })
    .then(response => response.ok ? 'reachable' : 'unreachable')
    .catch(() => 'unreachable');
  try { return await Promise.race([request, deadline]); }
  finally { if (timer !== undefined) clearTimeout(timer); controller.abort(); }
}
