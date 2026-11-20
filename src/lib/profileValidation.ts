export type SocialIntent = 'friends' | 'dating' | 'events' | 'casual';
export type PublicProfile = { id: string; display_name: string; bio: string; intent: SocialIntent };
const VALID_INTENTS: ReadonlySet<string> = new Set(['friends', 'dating', 'events', 'casual']);
export function validateProfileDraft(input: unknown): Omit<PublicProfile, 'id'> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid profile');
  const draft = input as Record<string, unknown>;
  if (typeof draft.display_name !== 'string' || typeof draft.bio !== 'string' || typeof draft.intent !== 'string' || !VALID_INTENTS.has(draft.intent)) throw new Error('Invalid profile fields');
  const display_name = draft.display_name.trim();
  const bio = draft.bio.trim();
  if (display_name.length < 2 || display_name.length > 40 || bio.length > 280) throw new Error('Profile field length invalid');
  return { display_name, bio, intent: draft.intent as SocialIntent };
}
export function validateProfileRecord(input: unknown, expectedUserId: string): PublicProfile {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid profile response');
  const draft = input as Record<string, unknown>;
  if (typeof draft.id !== 'string' || draft.id !== expectedUserId) throw new Error('Profile owner mismatch');
  const validated = validateProfileDraft(input);
  if (validated.display_name !== draft.display_name || validated.bio !== draft.bio) throw new Error('Noncanonical profile response');
  return { id: expectedUserId, ...validated };
}
