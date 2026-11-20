import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** Reject unsafe backend configuration before creating a client or sending a key. */
export function isSafePublicBackendConfig(url: unknown, key: unknown): boolean {
  if (typeof url !== 'string' || typeof key !== 'string' || url !== url.trim() || key !== key.trim()) return false;
  // Mobile clients may contain publishable keys, never service-role or secret keys.
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && /^[a-z0-9-]+\.supabase\.co$/.test(parsed.hostname) &&
      parsed.pathname === '/' && !parsed.username && !parsed.password &&
      !parsed.port && !parsed.search && !parsed.hash;
  } catch {
    return false;
  }
}

/** This only validates public client configuration, not backend readiness. */
export const supabase = isSafePublicBackendConfig(url, key)
  ? createClient(url as string, key as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
export const isBackendConfigured = Boolean(supabase);
