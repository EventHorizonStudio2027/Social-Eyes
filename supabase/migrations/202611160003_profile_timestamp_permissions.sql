revoke insert, update on table public.profiles from authenticated;
grant insert (id, display_name, bio, intent) on public.profiles to authenticated;
grant update (id, display_name, bio, intent) on public.profiles to authenticated;
revoke insert (created_at, updated_at), update (created_at, updated_at) on public.profiles from authenticated;
