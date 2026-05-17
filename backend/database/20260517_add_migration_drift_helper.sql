-- Exposes the Supabase-managed migration ledger via a public function so the
-- check-migration-drift script can query it through PostgREST/supabase-js with
-- the existing SUPABASE_SERVICE_ROLE_KEY (which does not have direct access to
-- the supabase_migrations schema via the REST API).

create or replace function public.servease_list_applied_migrations()
returns table (name text, version text)
language sql
security definer
set search_path = supabase_migrations, public
as $$
  select sm.name, sm.version
  from supabase_migrations.schema_migrations sm
  order by sm.version;
$$;

revoke all on function public.servease_list_applied_migrations() from public, anon, authenticated;
grant execute on function public.servease_list_applied_migrations() to service_role;
