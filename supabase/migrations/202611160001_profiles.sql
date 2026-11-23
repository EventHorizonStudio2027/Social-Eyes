-- Restored source-of-truth initial profile schema; apply only to an environment
-- where migration history confirms this migration has not already run.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(btrim(display_name)) between 2 and 40),
 bio text not null default '' check (char_length(bio) <= 280),
 intent text not null default 'friends' check (intent in ('friends','dating','events','casual')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, delete on public.profiles to authenticated;
create policy "profiles_owner_select" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_owner_insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_owner_update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles_owner_delete" on public.profiles for delete to authenticated using ((select auth.uid()) = id);
