-- Owner-scoped profile storage. Apply and verify on the intended Supabase project.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  bio text not null default '' check (char_length(bio) <= 280),
  intent text not null check (intent in ('friends','dating','events','casual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, delete on public.profiles to authenticated;
create policy "Owner can select profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Owner can insert profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Owner can update profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Owner can delete profile" on public.profiles for delete to authenticated using ((select auth.uid()) = id);
