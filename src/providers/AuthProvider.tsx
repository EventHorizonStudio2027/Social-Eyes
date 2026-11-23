import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AppState, Linking } from 'react-native';
import { parseRecoveryLink, RECOVERY_REDIRECT_URL } from '@/lib/recoveryLinks';
import { validateAuthInput, validateRecoveryEmail } from '@/lib/authInput';
import { shouldClearRecoveryForAuthEvent } from '@/lib/recoveryEvents';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<'signed-in' | 'confirm-email' | 'error'>;
  signOut: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resendConfirmation: (email: string) => Promise<boolean>;
  recoverySession: boolean;
  recoveryLinkChecking: boolean;
  updateRecoveryPassword: (password: string) => Promise<boolean>;
  cancelRecovery: () => Promise<boolean>;
};
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState<string | null>(null);
  const [recoverySession, setRecoverySession] = useState(false);
  // Keep ordinary navigation closed until the cold-start deep link is inspected.
  const [recoveryLinkChecking, setRecoveryLinkChecking] = useState(Boolean(supabase));
  const authEventSeen = useRef(false);
  const recoveryInFlight = useRef(false);
  const queuedRecoveryUrl = useRef<string | null>(null);
  const initialLinkPending = useRef(Boolean(supabase));
  useEffect(() => {
    if (!supabase) { initialLinkPending.current = false; setLoading(false); setRecoveryLinkChecking(false); return; }
    let active = true;
    authEventSeen.current = false;
    const client = supabase;
    client.auth.getSession().then(({ data, error: authError }) => {
      if (!active) return;
      // An auth event can arrive while getSession is pending; never overwrite its newer state.
      if (!authEventSeen.current) setSession(data.session);
      if (authError && !authEventSeen.current) setError(authError.message);
      setLoading(false);
    }).catch(() => { if (active && !authEventSeen.current) { setError('Unable to restore your session.'); setLoading(false); } });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => {
      if (active) { authEventSeen.current = true; setSession(next); setLoading(false);
        if (_event === 'PASSWORD_RECOVERY') setRecoverySession(true);
        if (shouldClearRecoveryForAuthEvent(_event, recoveryInFlight.current)) setRecoverySession(false);
      }
    });
    if (AppState.currentState === 'active') client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
    // Serialize recovery verification. A second link arriving during the first
    // verification must not be silently discarded or unlock navigation early.
    const handleRecoveryLink = async (incomingUrl: string | null) => {
      if (!active || !incomingUrl || !parseRecoveryLink(incomingUrl)) return;
      if (recoveryInFlight.current) {
        queuedRecoveryUrl.current = incomingUrl;
        return;
      }
      recoveryInFlight.current = true;
      setRecoveryLinkChecking(true);
      let nextUrl: string | null = incomingUrl;
      try {
        while (active && nextUrl) {
          const link = parseRecoveryLink(nextUrl);
          nextUrl = null;
          if (!link) break;
          setError(null);
          try {
            const { error: verifyError } = await client.auth.verifyOtp({ token_hash: link.tokenHash, type: link.type });
            if (active) {
              if (verifyError) { setRecoverySession(false); setError('Recovery link expired or invalid. Please request a new one.'); }
              else setRecoverySession(true);
            }
          } catch {
            if (active) { setRecoverySession(false); setError('Unable to verify recovery link. Please try again.'); }
          }
          nextUrl = queuedRecoveryUrl.current;
          queuedRecoveryUrl.current = null;
        }
      } finally {
        recoveryInFlight.current = false;
        queuedRecoveryUrl.current = null;
        if (active && !initialLinkPending.current) setRecoveryLinkChecking(false);
      }
    };
    const linkListener = Linking.addEventListener('url', event => { void handleRecoveryLink(event.url); });
    void Linking.getInitialURL()
      .then(async url => { await handleRecoveryLink(url); })
      .catch(() => { /* No initial link available; proceed with ordinary navigation. */ })
      .finally(() => {
        initialLinkPending.current = false;
        if (active && !recoveryInFlight.current) setRecoveryLinkChecking(false);
      });
    const appListener = AppState.addEventListener('change', state => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });
    return () => { active = false; initialLinkPending.current = false; queuedRecoveryUrl.current = null; subscription.unsubscribe(); linkListener.remove(); appListener.remove(); client.auth.stopAutoRefresh(); };
  }, []);
  const value = useMemo<AuthContextValue>(() => ({
    session, loading, error, recoverySession, recoveryLinkChecking, clearError: () => setError(null),
    cancelRecovery: async () => {
      if (!supabase) { setRecoverySession(false); return true; }
      // A recovery OTP creates an authenticated session. Leaving recovery must
      // invalidate that session rather than silently treating it as a normal login.
      try {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) { setError('Unable to exit recovery securely. Please retry.'); return false; }
        setRecoverySession(false);
        setError(null);
        return true;
      } catch { setError('Unable to exit recovery securely. Please retry.'); return false; }
    },
    updateRecoveryPassword: async (password) => {
      if (!supabase || !recoverySession) { setError('Open a valid password recovery link first.'); return false; }
      if (password.length < 8 || password.length > 1024) { setError('Use a password between 8 and 1024 characters.'); return false; }
      setError(null);
      try {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) { setError('Unable to update password. Please request another recovery link.'); return false; }
        // A recovery OTP creates a real authenticated session. Invalidate it
        // after changing the password, and require an ordinary sign-in.
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          setRecoverySession(true);
          setError('Password updated, but the recovery session could not be closed. Use Cancel recovery and sign out before continuing.');
          return false;
        }
        setRecoverySession(false);
        setSession(null);
        return true;
      } catch { setRecoverySession(true); setError('Unable to complete recovery securely. Please retry sign-out.'); return false; }
    },
    signIn: async (email, password) => {
      const input = validateAuthInput(email, password, 'sign-in');
      if (!input.ok) { setError(input.message); return false; }
      if (!supabase) { setError('Connect Supabase to enable accounts.'); return false; }
      setError(null);
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
        if (authError) { setError(authError.message); return false; }
        return true;
      } catch { setError('Unable to reach authentication service.'); return false; }
    },
    signUp: async (email, password) => {
      const input = validateAuthInput(email, password, 'sign-up');
      if (!input.ok) { setError(input.message); return 'error'; }
      if (!supabase) { setError('Connect Supabase to enable accounts.'); return 'error'; }
      setError(null);
      try {
        const { data, error: authError } = await supabase.auth.signUp({ email: input.email, password: input.password });
        if (authError) { setError(authError.message); return 'error'; }
        return data.session ? 'signed-in' : 'confirm-email';
      } catch { setError('Unable to reach authentication service.'); return 'error'; }
    },
    resendConfirmation: async (email) => {
      const input = validateRecoveryEmail(email);
      if (!input.ok) { setError(input.message); return false; }
      if (!supabase) { setError('Connect Supabase to enable accounts.'); return false; }
      setError(null);
      try {
        const { error: resendError } = await supabase.auth.resend({ type: 'signup', email: input.email });
        if (resendError) { setError('Unable to resend confirmation right now. Please try again later.'); return false; }
        return true;
      } catch { setError('Unable to resend confirmation right now. Please try again later.'); return false; }
    },
    requestPasswordReset: async (email) => {
      const input = validateRecoveryEmail(email);
      if (!input.ok) { setError(input.message); return false; }
      if (!supabase) { setError('Connect Supabase to enable accounts.'); return false; }
      setError(null);
      try {
        // Supabase uses the project's configured Site URL for the recovery link.
        // A native deep-link recovery flow is a separate, unverified milestone.
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: RECOVERY_REDIRECT_URL });
        if (resetError) { setError('Unable to request a reset email. Please try again later.'); return false; }
        return true;
      } catch { setError('Unable to request a reset email. Please try again later.'); return false; }
    },
    signOut: async () => {
      if (!supabase) return false;
      setError(null);
      try {
        const { error: authError } = await supabase.auth.signOut();
        if (authError) { setError(authError.message); return false; }
        return true;
      } catch { setError('Unable to sign out. Please retry.'); return false; }
    },
  }), [session, loading, error, recoverySession, recoveryLinkChecking]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
