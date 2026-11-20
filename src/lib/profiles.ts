import { supabase } from '@/lib/supabase';
import { validateProfileDraft, validateProfileRecord } from '@/lib/profileValidation';
import type { PublicProfile, SocialIntent } from '@/lib/profileValidation';
export type { PublicProfile, SocialIntent };
export async function getMyProfile(userId: string): Promise<PublicProfile | null> {
  if (!supabase) throw new Error('Backend not configured');
  const { data: identity, error: authError } = await supabase.auth.getUser();
  if (authError || !identity.user || identity.user.id !== userId) throw new Error('Not authorized to read profile');
  const { data, error } = await supabase.from('profiles').select('id,display_name,bio,intent').eq('id', identity.user.id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: current, error: currentError } = await supabase.auth.getUser();
  if (currentError || !current.user || current.user.id !== userId) throw new Error('Session changed while loading profile');
  return validateProfileRecord(data, current.user.id);
}
export async function saveMyProfile(profile: PublicProfile): Promise<PublicProfile> {
  if (!supabase) throw new Error('Backend not configured');
  const { data: identity, error: authError } = await supabase.auth.getUser();
  if (authError || !identity.user || identity.user.id !== profile.id) throw new Error('Not authorized to save profile');
  const validated = validateProfileDraft(profile);
  const { data, error } = await supabase.from('profiles').upsert({ id: identity.user.id, ...validated }, { onConflict: 'id' }).select('id,display_name,bio,intent').single();
  if (error) throw error;
  const { data: current, error: currentError } = await supabase.auth.getUser();
  if (currentError || !current.user || current.user.id !== profile.id) throw new Error('Session changed while saving profile');
  return validateProfileRecord(data, current.user.id);
}
