import AsyncStorage from '@react-native-async-storage/async-storage';

export type PrivacySettings = {
  incognito: boolean;
  showIntentions: boolean;
  allowNotifications: boolean;
};

export const defaultSettings = Object.freeze({
  incognito: true,
  showIntentions: false,
  allowNotifications: false,
});
const STORAGE_KEY = 'social-eyes:settings:v1';
const fields = ['incognito', 'showIntentions', 'allowNotifications'];

function isRecord(value: unknown) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function validateSettingsPatch(patch: Partial<PrivacySettings>) {
  if (!isRecord(patch) || Object.getOwnPropertySymbols(patch).length) throw new TypeError('Privacy settings patch is invalid');
  const entries = Object.entries(patch);
  if (!entries.length) throw new TypeError('Privacy settings patch cannot be empty');
  const result = {};
  for (const [key, value] of entries) {
    if (!fields.includes(key) || typeof value !== 'boolean') throw new TypeError('Privacy settings patch is invalid');
    Object.assign(result, { [key]: value });
  }
  return result;
}
export function validateSettings(settings: PrivacySettings) {
  if (!isRecord(settings)) throw new TypeError('Privacy settings are invalid');
  const result = {};
  for (const key of fields) {
    if (!Object.prototype.hasOwnProperty.call(settings, key) || typeof settings[key] !== 'boolean')
      throw new TypeError('Privacy settings are invalid');
    Object.assign(result, { [key]: settings[key] });
  }
  return result;
}
export async function loadSettings() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) return { ...defaultSettings };
  let value;
  try { value = JSON.parse(raw); } catch { throw new Error('Saved privacy preference is invalid'); }
  try { return validateSettings(value); } catch { throw new Error('Saved privacy preference is invalid'); }
}
export async function saveSettings(settings: PrivacySettings) {
  const validated = validateSettings(settings);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
}
