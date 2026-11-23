-- Read-only audit: run against the intended Supabase project and inspect every result.
-- Never interprets a healthy project as proof of owner-only data access.
select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname='profiles';
select
 has_table_privilege('anon','public.profiles','SELECT') as anon_can_select,
 has_table_privilege('authenticated','public.profiles','SELECT') as authenticated_can_select,
 has_column_privilege('authenticated','public.profiles','created_at','UPDATE') as can_edit_created_at,
 has_column_privilege('authenticated','public.profiles','updated_at','UPDATE') as can_edit_updated_at;
select policyname, cmd, roles, qual, with_check
from pg_policies where schemaname='public' and tablename='profiles';
-- Inspect policy predicates for auth.uid ownership checks.
select t.tgname, t.tgenabled, p.proname
from pg_trigger t join pg_proc p on p.oid=t.tgfoid
where t.tgrelid='public.profiles'::regclass and not t.tgisinternal;
-- Verification checklist: foreach operation in array array['SELECT','INSERT','UPDATE','DELETE']
-- Verify each operation's owner policy and auth.uid() predicate with two test users.
