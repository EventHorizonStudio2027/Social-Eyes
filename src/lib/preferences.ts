/**
 * Strict privacy-preference helpers. No remote writes or visibility side effects.
 * The native settings module owns persistence; this module owns pure normalization.
 */
export type PrivacyPreferences = {
  incognito: boolean;
  showIntentions: boolean;
  allowNotifications: boolean;
};

export const privacyDefaults: Readonly<PrivacyPreferences> = Object.freeze({
  incognito: true,
  showIntentions: false,
  allowNotifications: false,
});

export function normalizePreferences(value: unknown): PrivacyPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...privacyDefaults };
  const raw = value as Record<string, unknown>;
  return {
    incognito: typeof raw.incognito === 'boolean' ? raw.incognito : true,
    showIntentions: typeof raw.showIntentions === 'boolean' ? raw.showIntentions : false,
    allowNotifications: typeof raw.allowNotifications === 'boolean' ? raw.allowNotifications : false,
  };
}

export function isDiscoverable(preferences: PrivacyPreferences, checkedInAtVenue: boolean): boolean {
  return checkedInAtVenue === true && preferences.incognito === false;
}
