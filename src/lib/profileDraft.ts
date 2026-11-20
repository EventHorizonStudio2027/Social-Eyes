import type { PublicProfile, SocialIntent } from './profileTypes';
import { validateProfileDraft } from './profileValidation';
export type ProfileDraft = { display_name: string; bio: string; intent: SocialIntent };
export function savedProfileSnapshot(input: ProfileDraft): Omit<PublicProfile, 'id'> {
  return validateProfileDraft(input);
}
export function hasProfileChanges(current: ProfileDraft, saved: ProfileDraft | null): boolean {
  const normalized = { display_name: current.display_name.trim(), bio: current.bio.trim(), intent: current.intent };
  if (!saved) return Boolean(normalized.display_name || normalized.bio);
  return normalized.display_name !== saved.display_name.trim() || normalized.bio !== saved.bio.trim() || normalized.intent !== saved.intent;
}
