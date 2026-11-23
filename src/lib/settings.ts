import AsyncStorage from '@react-native-async-storage/async-storage';

export type PrivacySettings = { incognito: boolean; allowNotifications: boolean; showIntentions: boolean };
export const defaultSettings: PrivacySettings = { incognito: true, allowNotifications: false, showIntentions: false };
const key = 'social-eyes:settings:v1';
const fields = ['incognito', 'allowNotifications', 'showIntentions'] as const;
export function validateSettings(value: unknown): PrivacySettings {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !fields.every(field => typeof (value as Record<string, unknown>)[field] === 'boolean')) throw new Error('Privacy settings are invalid');
  const input = value as Record<string, unknown>;
  return { incognito: input.incognito as boolean, allowNotifications: input.allowNotifications as boolean, showIntentions: input.showIntentions as boolean };
}
export function validateSettingsPatch(value: unknown): Partial<PrivacySettings> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Privacy settings patch is invalid');
  const input = value as Record<string, unknown>;
  const keys = Object.keys(input);
  if (!keys.length || keys.some(field => !fields.includes(field as typeof fields[number]) || typeof input[field] !== 'boolean')) throw new Error('Privacy settings patch is invalid');
  return input as Partial<PrivacySettings>;
}
export async function loadSettings(): Promise<PrivacySettings> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return { ...defaultSettings };
  try { return validateSettings(JSON.parse(raw)); }
  catch { throw new Error('Stored privacy settings are invalid or corrupt'); }
}
export async function saveSettings(value: PrivacySettings): Promise<void> {
  const valid = validateSettings(value);
  await AsyncStorage.setItem(key, JSON.stringify(valid));
}
