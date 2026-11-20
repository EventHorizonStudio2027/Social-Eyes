import AsyncStorage from '@react-native-async-storage/async-storage';
const SETTINGS_KEY = 'social-eyes:settings:v1';
export type PrivacySettings = { incognito: boolean; allowNotifications: boolean; showIntentions: boolean };
export const defaultSettings = Object.freeze({ incognito: true, allowNotifications: false, showIntentions: false });
const fields = ['incognito', 'allowNotifications', 'showIntentions'];
const own = (value: object, field: string) => Object.prototype.hasOwnProperty.call(value, field);

export function validateSettingsPatch(patch: Partial<PrivacySettings>): Partial<PrivacySettings> {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch) ||
    Reflect.ownKeys(patch).length === 0 || Reflect.ownKeys(patch).some(key => typeof key !== 'string' || !fields.includes(key))) {
    throw new Error('Privacy settings patch invalid');
  }
  const result = {};
  for (const field of fields) {
    if (own(patch, field)) {
      if (typeof patch[field] !== 'boolean') throw new Error('Privacy settings patch invalid');
      Object.defineProperty(result, field, { value: patch[field], enumerable: true, writable: true, configurable: true });
    }
  }
  return result;
}

export function validateSettings(input: unknown): PrivacySettings {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Privacy settings invalid');
  const result = {};
  for (const field of fields) {
    if (!own(input, field) || typeof input[field] !== 'boolean') throw new Error('Privacy settings invalid');
    Object.defineProperty(result, field, { value: input[field], enumerable: true, writable: true, configurable: true });
  }
  return result;
}

export async function loadSettings(): Promise<PrivacySettings> {
  const stored = await AsyncStorage.getItem(SETTINGS_KEY);
  if (stored === null) return { ...defaultSettings };
  let parsed;
  try { parsed = JSON.parse(stored); }
  catch { throw new Error('Stored privacy settings invalid'); }
  try { return validateSettings(parsed); }
  catch { throw new Error('Stored privacy settings invalid'); }
}

export async function saveSettings(settings: PrivacySettings): Promise<void> {
  const validated = validateSettings(settings);
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(validated));
}
