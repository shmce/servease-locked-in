-- Owner: Auth Service
-- Purpose: Surface the current Supabase auth.users last_sign_in_at to the
-- gateway so /v1/me/sessions can return a real session record instead of
-- an empty array. Multi-session tracking would require an external
-- session store; this RPC exposes the one piece of session metadata the
-- platform already has.

create or replace function public.servease_list_user_sessions(p_user_id uuid)
returns table (
  id text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email text
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  return query
  select
    u.id::text as id,
    u.created_at,
    u.last_sign_in_at,
    u.email
  from auth.users u
  where u.id = p_user_id
  limit 1;
end;
$$;

revoke all on function public.servease_list_user_sessions(uuid) from public;
grant execute on function public.servease_list_user_sessions(uuid) to service_role;
