-- Read-only Phase 1 catalog audit. Execute with a privileged, read-only connection.
-- Checks metadata only; does not replace live two-user RLS probes.
do $audit$
declare
  operation text;
  policy_count integer;
  owner_policy_count integer;
  trigger_count integer;
  enabled boolean;
begin
  select c.relrowsecurity into enabled
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'profiles';
  if enabled is distinct from true then raise exception 'profiles RLS is not enabled'; end if;
  if has_table_privilege('anon', 'public.profiles', 'SELECT')
     or has_table_privilege('anon', 'public.profiles', 'INSERT')
     or has_table_privilege('anon', 'public.profiles', 'UPDATE')
     or has_table_privilege('anon', 'public.profiles', 'DELETE') then
    raise exception 'anonymous profile table privilege detected';
  end if;
  if has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE')
     or has_column_privilege('authenticated', 'public.profiles', 'created_at', 'UPDATE')
     or has_column_privilege('authenticated', 'public.profiles', 'updated_at', 'UPDATE') then
    raise exception 'immutable profile column is writable';
  end if;
  if (select count(*) from pg_policies where schemaname='public' and tablename='profiles') <> 4 then
    raise exception 'unexpected total profile policy count';
  end if;
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname like '%profile%'
      and has_function_privilege('authenticated', p.oid, 'EXECUTE')
  ) then raise exception 'authenticated role can execute a profile security function'; end if;
  foreach operation in array array['SELECT','INSERT','UPDATE','DELETE'] loop
    select count(*), count(*) filter (where
      (qual is null or qual ~ 'auth\.uid')
      and (with_check is null or with_check ~ 'auth\.uid')
      and (qual is not null or with_check is not null))
    into policy_count, owner_policy_count
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and (cmd = operation or cmd = 'ALL');
    if policy_count <> 1 or owner_policy_count <> 1 then
      raise exception 'unexpected policy count or owner guard for %', operation;
    end if;
  end loop;
  select count(*) into trigger_count
    from pg_trigger t join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'profiles'
      and not t.tgisinternal and t.tgenabled <> 'D';
  if trigger_count <> 1 then raise exception 'unexpected profile trigger count'; end if;
end
$audit$;
