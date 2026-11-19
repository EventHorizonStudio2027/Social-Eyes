import type { PublicProfile, SocialIntent } from './profileTypes';
const VALID_INTENTS: ReadonlySet<string> = new Set(['friends', 'dating', 'events', 'casual']);
export function validateProfileDraft(input: unknown): Omit<PublicProfile, 'id'> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid profile draft');
  const draft = input as Record<string, unknown>;
  if (typeof draft.display_name !== 'string' || typeof draft.bio !== 'string' || typeof draft.intent !== 'string') throw new Error('Invalid profile fields');
  const name = draft.display_name.trim();
  const bio = draft.bio.trim();
  if (Array.from(name).length < 2 || Array.from(name).length > 40 || Array.from(bio).length > 280) throw new Error('Invalid profile length');
  if (/[\x00-\x1f\x7f]/.test(name) || /[\x00-\x09\x0b-\x1f\x7f]/.test(bio)) throw new Error('Invalid profile control characters');
  if (!VALID_INTENTS.has(draft.intent)) throw new Error('Invalid profile intent');
  return { display_name: name, bio, intent: draft.intent as SocialIntent };
}
export function validateProfileRecord(input: unknown, expectedUserId: string): PublicProfile {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid server profile');
  const record = input as Record<string, unknown>;
  if (typeof record.id !== 'string' || record.id !== expectedUserId) throw new Error('Profile owner mismatch');
  const validated = validateProfileDraft(record);
  if (validated.display_name !== record.display_name || validated.bio !== record.bio) throw new Error('Uncanonical server profile');
  return { id: expectedUserId, ...validated };
}
