import { supabase } from '@/lib/supabase';
import { validateProfileDraft, validateProfileRecord } from '@/lib/profileValidation';
export type SocialIntent = 'friends' | 'dating' | 'events' | 'casual';
export type PublicProfile = { id: string; display_name: string; bio: string; intent: SocialIntent };
/** Profile access is strictly bound to the authenticated identity, not a caller-supplied user ID. */
export async function getMyProfile(userId: string): Promise<PublicProfile | null> {
  if (!supabase) throw new Error('Backend is not configured');
  const current = await supabase.auth.getUser();
  const identity = current.data;
  if (current.error || !identity.user || identity.user.id !== userId) throw new Error('Profile authentication required');
  const { data, error } = await supabase.from('profiles').select('id,display_name,bio,intent').eq('id', current.data.user.id).maybeSingle();
  if (error) throw error;
  const latest = await supabase.auth.getUser();
  if (latest.error || latest.data.user?.id !== userId) throw new Error('Account changed during profile read');
  return data ? validateProfileRecord(data, userId) : null;
}
export async function saveMyProfile(profile: PublicProfile): Promise<PublicProfile> {
  if (!supabase) throw new Error('Backend is not configured');
  const current = await supabase.auth.getUser();
  const identity = current.data;
  if (current.error || !identity.user || identity.user.id !== profile.id) throw new Error('Profile authentication required');
  const validated = validateProfileDraft(profile);
  const { data, error } = await supabase.from('profiles').upsert({ id: identity.user.id, ...validated }, { onConflict: 'id' }).select('id,display_name,bio,intent').single();
  if (error) throw error;
  const latest = await supabase.auth.getUser();
  if (latest.error || latest.data.user?.id !== profile.id) throw new Error('Account changed during profile save');
  return validateProfileRecord(data, profile.id);
}
