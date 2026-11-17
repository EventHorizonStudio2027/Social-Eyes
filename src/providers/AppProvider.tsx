import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { checkBackendHealth, type BackendStatus } from '@/lib/backendHealth';
import { LatestRequest } from '@/lib/latestRequest';
import { backendLifecycleAction } from '@/lib/backendLifecycle';
import { defaultSettings, loadSettings, saveSettings, validateSettingsPatch, type PrivacySettings } from '@/lib/settings';

type AppContextValue = {
  settings: PrivacySettings;
  settingsReady: boolean;
  settingsStorageAvailable: boolean;
  settingsSaving: boolean;
  settingsError: string | null;
  updateSettings: (patch: Partial<PrivacySettings>) => Promise<void>;
  retrySettings: () => Promise<void>;
  backendStatus: BackendStatus;
  refreshBackend: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<PrivacySettings>({ ...defaultSettings });
  const [settingsReady, setSettingsReady] = useState(false);
  const [settingsStorageAvailable, setSettingsStorageAvailable] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(AppState.currentState === 'active' ? 'checking' : 'paused');
  const settingsWriteInFlight = useRef(false);
  const mounted = useRef(true);
  const appActive = useRef(AppState.currentState === 'active');
  const backendRequests = useRef(new LatestRequest());
  const settingsLoadSequence = useRef(0);
  // Distinguishes a previous mount from a Strict Mode effect replay.
  const mountGeneration = useRef(0);

  const retrySettings = useCallback(async () => {
    // Never reload stale device data while a preference write is pending.
    if (settingsWriteInFlight.current) return;
    const sequence = ++settingsLoadSequence.current;
    try {
      const saved = await loadSettings();
      if (!mounted.current || sequence !== settingsLoadSequence.current || settingsWriteInFlight.current) return;
      setSettings(saved);
      setSettingsStorageAvailable(true);
      setSettingsError(null);
    } catch {
      if (!mounted.current || sequence !== settingsLoadSequence.current || settingsWriteInFlight.current) return;
      setSettings({ ...defaultSettings });
      setSettingsStorageAvailable(false);
      setSettingsError('Device settings could not be loaded. Privacy-safe defaults are displayed; saved and server-side visibility cannot be verified.');
    } finally {
      if (mounted.current && sequence === settingsLoadSequence.current) setSettingsReady(true);
    }
  }, []);

  const updateSettings = useCallback(async (patch: Partial<PrivacySettings>) => {
    if (!mounted.current || !settingsReady || !settingsStorageAvailable || settingsWriteInFlight.current) return;
    // Reject malformed updates before touching the saving indicator or storage.
    const validatedPatch = validateSettingsPatch(patch);
    settingsWriteInFlight.current = true;
    const writeGeneration = mountGeneration.current;
    // Invalidate any in-flight load before starting the write.
    ++settingsLoadSequence.current;
    setSettingsSaving(true);
    const next = { ...settings, ...validatedPatch };
    // Save first so UI never indicates a setting persisted when it did not.
    try {
      await saveSettings(next);
      if (mounted.current && writeGeneration === mountGeneration.current) { setSettings(next); setSettingsError(null); }
    } catch {
      // A rejected storage operation can have an uncertain commit outcome.
      // Do not claim the previous value is still persisted or permit further edits.
      // A write from a previous mount must not invalidate a newer mount's load.
      if (mounted.current && writeGeneration === mountGeneration.current) {
        ++settingsLoadSequence.current;
        setSettings({ ...defaultSettings });
        setSettingsStorageAvailable(false);
        setSettingsError('Could not confirm that your preference was saved. Privacy-safe defaults are displayed, but saved and server-side visibility cannot be verified. Reload saved preferences before making another change.');
      }
    } finally {
      settingsWriteInFlight.current = false;
      if (mounted.current && writeGeneration === mountGeneration.current) {
        setSettingsSaving(false);
      } else if (mounted.current) {
        // Strict Mode may replay setup while a write is in flight. Its initial
        // reload was skipped; reconcile storage after that write settles.
        void retrySettings();
      }
    }
  }, [settings, settingsReady, settingsStorageAvailable]);

  const refreshBackend = useCallback(async () => {
    // Manual refreshes are ignored when backgrounded or after teardown.
    if (!mounted.current || !appActive.current) return;
    const sequence = backendRequests.current.begin();
    setBackendStatus('checking');
    // A rejected health check must never strand the indicator on 'checking'.
    let result: BackendStatus;
    try {
      result = await checkBackendHealth();
    } catch {
      result = 'unreachable';
    }
    // Ignore superseded requests and responses arriving after unmount.
    if (mounted.current && appActive.current && backendRequests.current.isCurrent(sequence)) setBackendStatus(result);
  }, []);

  useEffect(() => {
    // React Strict Mode replays effect setup/cleanup in development.
    // Restore mount state on every setup, not only on the first render.
    mounted.current = true;
    ++mountGeneration.current;
    // Never expose previous-mount settings as confirmed during a replay.
    setSettingsReady(false);
    setSettingsSaving(false);
    setSettingsStorageAvailable(false);
    setSettings({ ...defaultSettings });
    setSettingsError(null);
    // Reload after every setup, including Strict Mode effect replay.
    // A write in progress defers the reload until its finally block.
    void retrySettings();
    appActive.current = AppState.currentState === 'active';
    if (appActive.current) void refreshBackend();
    else setBackendStatus('paused');
    return () => {
      mounted.current = false;
      ++mountGeneration.current;
      backendRequests.current.invalidate();
      ++settingsLoadSequence.current;
    };
  }, [refreshBackend, retrySettings]);
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      const nextActive = backendLifecycleAction(state) === 'refresh';
      // Ignore duplicate active events; only a real transition needs a new check.
      if (nextActive === appActive.current) return;
      appActive.current = nextActive;
      if (appActive.current) {
        void refreshBackend();
      } else {
        // An in-flight check is no longer current while the app is inactive.
        backendRequests.current.invalidate();
        setBackendStatus('paused');
      }
    });
    return () => listener.remove();
  }, [refreshBackend]);

  const value = useMemo(() => ({ settings, settingsReady, settingsStorageAvailable, settingsSaving, settingsError, updateSettings, retrySettings, backendStatus, refreshBackend }),
    [settings, settingsReady, settingsStorageAvailable, settingsSaving, settingsError, updateSettings, retrySettings, backendStatus, refreshBackend]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
