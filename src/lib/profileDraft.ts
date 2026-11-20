import { validateProfileDraft } from '@/lib/profileValidation';
import type { PublicProfile, SocialIntent } from '@/lib/profileValidation';
export type ProfileDraft = { display_name: string; bio: string; intent: SocialIntent };
export function hasProfileChanges(current: ProfileDraft, saved: ProfileDraft | null): boolean {
  const normalize = (draft: ProfileDraft) => ({ display_name: draft.display_name.trim(), bio: draft.bio.trim(), intent: draft.intent });
  const now = normalize(current);
  if (!saved) return Boolean(now.display_name || now.bio || now.intent !== 'friends');
  const previous = normalize(saved);
  return now.display_name !== previous.display_name || now.bio !== previous.bio || now.intent !== previous.intent;
}
export function savedProfileSnapshot(input: ProfileDraft): Omit<PublicProfile, 'id'> {
  return validateProfileDraft(input);
}
