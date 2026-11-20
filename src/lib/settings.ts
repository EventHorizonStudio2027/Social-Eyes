import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'social-eyes:privacy-settings:v1';

export type PrivacySettings = {
  incognito: boolean;
  allowNotifications: boolean;
  showIntentions: boolean;
};

export const defaultSettings: Readonly<PrivacySettings> = Object.freeze({
  incognito: true,
  allowNotifications: false,
  showIntentions: false,
});

const keys = Object.keys(defaultSettings) as (keyof PrivacySettings)[];

export function validateSettingsPatch(patch: Partial<PrivacySettings>): Partial<PrivacySettings> {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error('Invalid privacy settings patch');
  const result: Partial<PrivacySettings> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (!keys.includes(key as keyof PrivacySettings) || typeof value !== 'boolean') {
      throw new Error('Unknown or invalid privacy setting');
    }
    Object.assign(result, { [key]: value });
  }
  return result;
}

export async function loadSettings(): Promise<PrivacySettings> {
  const stored = await AsyncStorage.getItem(SETTINGS_KEY);
  if (stored === null) return { ...defaultSettings };
  const parsed: unknown = JSON.parse(stored);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid saved settings');
  return { ...defaultSettings, ...validateSettingsPatch(parsed as Partial<PrivacySettings>) };
}

export async function saveSettings(settings: PrivacySettings): Promise<void> {
  const validated = validateSettingsPatch(settings);
  if (keys.some(key => typeof validated[key] !== 'boolean')) throw new Error('Incomplete privacy settings');
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(validated));
}
