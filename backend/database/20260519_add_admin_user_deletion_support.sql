-- Owner: Admin Service
-- Purpose: Support deleting admin accounts while cleaning admin access metadata.

delete from admin.admin_user_access a
where not exists (
  select 1
  from identity_and_user.users u
  where u.id = a.admin_user_id
);

alter table admin.admin_user_access
  drop constraint if exists admin_user_access_admin_user_id_fkey;

alter table admin.admin_user_access
  add constraint admin_user_access_admin_user_id_fkey
  foreign key (admin_user_id)
  references identity_and_user.users(id)
  on delete cascade;

create or replace function public.servease_admin_delete_user_access(
  p_admin_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = admin, public
as $$
begin
  if p_admin_user_id is null then
    raise exception 'invalid_admin_user_access_request';
  end if;

  delete from admin.admin_user_access
  where admin_user_id = p_admin_user_id;
end;
$$;

revoke all on function public.servease_admin_delete_user_access(uuid)
  from public, anon, authenticated;
grant execute on function public.servease_admin_delete_user_access(uuid)
  to service_role;
