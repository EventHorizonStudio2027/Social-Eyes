import { supabase } from '@/lib/supabase';
import { validateProfileDraft, validateProfileRecord, type PublicProfile } from '@/lib/profileValidation';

let saveInProgress = false;
async function authenticatedOwner() {
  if (!supabase) throw new Error('Backend unavailable');
  const identity = await supabase.auth.getUser();
  if (identity.error) throw identity.error;
  if (!identity.data.user?.id) throw new Error('Profile owner mismatch');
  return { user: identity.data.user };
}
export async function getMyProfile(userId: string): Promise<PublicProfile | null> {
  const identity = await authenticatedOwner();
  if (identity.user.id !== userId) throw new Error('Profile owner mismatch');
  const { data, error } = await supabase!.from('profiles').select('id,display_name,bio,intent').eq('id', userId).maybeSingle();
  if (error) throw error;
  const current = await authenticatedOwner();
  if (current.user.id !== userId) throw new Error('Profile owner changed during request');
  return data ? validateProfileRecord(data, current.user.id) : null;
}
export async function saveMyProfile(profile: PublicProfile): Promise<PublicProfile> {
  if (saveInProgress) throw new Error('Profile save already in progress');
  saveInProgress = true;
  try {
    const validated = validateProfileDraft(profile);
    const identity = await authenticatedOwner();
    if (identity.user.id !== profile.id) throw new Error('Profile owner mismatch');
    const beforeWrite = await authenticatedOwner();
    if (beforeWrite.user.id !== identity.user.id) throw new Error('Profile owner changed before write');
    const payload = { id: identity.user.id, ...validated };
    const { error } = await supabase!.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    const confirmed = await getMyProfile(identity.user.id);
    if (!confirmed || confirmed.display_name !== validated.display_name || confirmed.bio !== validated.bio || confirmed.intent !== validated.intent)
      throw new Error('Profile save could not be verified');
    return confirmed;
  } finally { saveInProgress = false; }
}
