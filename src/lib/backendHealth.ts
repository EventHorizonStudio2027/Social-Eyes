import { isBackendConfigured, isSafePublicBackendConfig } from '@/lib/supabase';
export type BackendStatus = 'unconfigured' | 'reachable' | 'unreachable';
/** Public auth endpoint reachability, not database authorization. */
export async function checkBackendHealth(): Promise<BackendStatus> {
  const raw = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!isBackendConfigured || !isSafePublicBackendConfig(raw, key)) return 'unconfigured';
  let endpoint: URL;
  try {
    endpoint = new URL(raw!);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || (endpoint.pathname !== '/' && endpoint.pathname !== '')) return 'unconfigured';
  } catch { return 'unconfigured'; }
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const request: Promise<BackendStatus> = Promise.resolve().then(() => fetch(endpoint.origin + '/auth/v1/health', {
    method: 'GET', headers: { apikey: key! }, signal: controller.signal,
  })).then(response => response.ok ? 'reachable' : 'unreachable', () => 'unreachable');
  try {
    return await Promise.race([request, new Promise<BackendStatus>(resolve => {
      timer = setTimeout(() => { controller.abort(); resolve('unreachable'); }, 6000);
    })]);
  } finally { if (timer !== undefined) clearTimeout(timer); }
}
