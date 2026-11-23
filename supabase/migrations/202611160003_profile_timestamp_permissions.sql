-- Clients may update profile content, never server-managed timestamps.
revoke insert, update on table public.profiles from authenticated;
grant insert (id, display_name, bio, intent) on table public.profiles to authenticated;
grant update (id, display_name, bio, intent) on table public.profiles to authenticated;
revoke insert (created_at, updated_at), update (created_at, updated_at) on table public.profiles from authenticated;
