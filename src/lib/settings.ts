import AsyncStorage from '@react-native-async-storage/async-storage';

/** Device-only preferences. These do not enable venue visibility or server presence. */
export type PrivacySettings = {
  incognito: boolean;
  showIntentions: boolean;
  allowNotifications: boolean;
};

export const defaultSettings: Readonly<PrivacySettings> = Object.freeze({
  incognito: true,
  showIntentions: false,
  allowNotifications: false,
});

const STORAGE_KEY = 'social-eyes:privacy-settings:v1';
const keys: readonly (keyof PrivacySettings)[] = ['incognito', 'showIntentions', 'allowNotifications'];

export function validateSettingsPatch(patch: Partial<PrivacySettings>): Partial<PrivacySettings> {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new TypeError('Invalid privacy settings');
  const validated: Partial<PrivacySettings> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (!keys.includes(key as keyof PrivacySettings) || typeof value !== 'boolean')
      throw new TypeError('Invalid privacy preference: ' + key);
    Object.assign(validated, { [key]: value });
  }
  return validated;
}

export async function loadSettings(): Promise<PrivacySettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) return { ...defaultSettings };
  let data: unknown;
  try { data = JSON.parse(raw); } catch { throw new Error('Saved privacy preferences are invalid'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Saved privacy preferences are invalid');
  const parsed = data as Record<string, unknown>;
  for (const key of keys) if (typeof parsed[key] !== 'boolean') throw new Error('Saved privacy preference is invalid: ' + key);
  return { incognito: parsed.incognito as boolean, showIntentions: parsed.showIntentions as boolean,
    allowNotifications: parsed.allowNotifications as boolean };
}

export async function saveSettings(settings: PrivacySettings): Promise<void> {
  const validated = validateSettingsPatch(settings);
  if (keys.some(key => typeof validated[key] !== 'boolean')) throw new TypeError('Incomplete privacy preferences');
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
}
