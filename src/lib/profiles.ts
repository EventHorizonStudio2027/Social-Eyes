import { supabase } from '@/lib/supabase';
import { validateProfileDraft, validateProfileRecord } from '@/lib/profileValidation';

export type SocialIntent = 'friends' | 'dating' | 'events' | 'casual';
export type PublicProfile = { id: string; display_name: string; bio: string; intent: SocialIntent };
const savingProfiles = new Set<string>();

async function requireOwner(userId: string, changedMessage: string): Promise<void> {
  if (!supabase) throw new Error('Backend is not configured');
  const identity = await supabase.auth.getUser();
  if (identity.error || !identity.data.user || identity.data.user.id !== userId) throw new Error(changedMessage);
}

/** Reads are owner-scoped and never return data after a session switch. */
export async function getMyProfile(userId: string): Promise<PublicProfile | null> {
  if (!supabase) throw new Error('Backend is not configured');
  const identity = await supabase.auth.getUser();
  if (identity.error || !identity.data.user || identity.data.user.id !== userId) throw new Error('Profile owner mismatch');
  const { data, error } = await supabase.from('profiles').select('id,display_name,bio,intent').eq('id', userId).maybeSingle();
  if (error) throw error;
  await requireOwner(userId, 'Profile owner changed during request');
  return data ? validateProfileRecord(data, userId) : null;
}

/** Save once, then verify the persisted record and current owner before reporting success. */
export async function saveMyProfile(profile: PublicProfile): Promise<PublicProfile> {
  if (!supabase) throw new Error('Backend is not configured');
  if (savingProfiles.has(profile.id)) throw new Error('Profile save already in progress');
  savingProfiles.add(profile.id);
  try {
    const identity = await supabase.auth.getUser();
    if (identity.error || !identity.data.user || identity.data.user.id !== profile.id) throw new Error('Profile owner mismatch');
    const validated = validateProfileDraft(profile);
    await requireOwner(profile.id, 'Profile owner changed before write');
    const { error } = await supabase.from('profiles').upsert({ id: identity.data.user.id, ...validated }, { onConflict: 'id' });
    if (error) throw error;
    await requireOwner(profile.id, 'Profile owner changed during request');
    const { data, error: readError } = await supabase.from('profiles').select('id,display_name,bio,intent').eq('id', profile.id).maybeSingle();
    if (readError) throw readError;
    await requireOwner(profile.id, 'Profile owner changed during request');
    if (!data) throw new Error('Saved profile could not be verified');
    const saved = validateProfileRecord(data, profile.id);
    if (saved.display_name !== validated.display_name || saved.bio !== validated.bio || saved.intent !== validated.intent) throw new Error('Saved profile differs from requested changes');
    return saved;
  } finally {
    savingProfiles.delete(profile.id);
  }
}
