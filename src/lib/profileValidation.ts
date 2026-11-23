import type { PublicProfile, SocialIntent } from '@/lib/profiles';
const VALID_INTENTS: ReadonlySet<string> = new Set(['friends', 'dating', 'events', 'casual']);
export function validateProfileDraft(input: unknown): Omit<PublicProfile, 'id'> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid profile');
  const draft = input as Record<string, unknown>;
  if (typeof draft.display_name !== 'string' || typeof draft.bio !== 'string' || typeof draft.intent !== 'string' || !VALID_INTENTS.has(draft.intent)) throw new Error('Invalid profile fields');
  const display_name = draft.display_name.trim();
  const bio = draft.bio.trim();
  if ([...display_name].length < 2 || [...display_name].length > 40 || [...bio].length > 280 || /[\x00-\x1f\x7f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/i.test(display_name + bio)) throw new Error('Invalid profile length or characters');
  return { display_name, bio, intent: draft.intent as SocialIntent };
}
export function validateProfileRecord(input: unknown, expectedUserId: string): PublicProfile {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid profile record');
  const draft = input as Record<string, unknown>;
  if (typeof draft.id !== 'string' || draft.id !== expectedUserId) throw new Error('Profile owner mismatch');
  const validated = validateProfileDraft(draft);
  if (validated.display_name !== draft.display_name || validated.bio !== draft.bio) throw new Error('Noncanonical profile record');
  return { id: expectedUserId, ...validated };
}
