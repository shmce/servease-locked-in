-- Owner: Catalog Service
-- Purpose: Keep admin provider application document reads behind service-role RPCs.

create or replace function public.servease_admin_list_provider_application_documents(
  p_provider_id uuid
)
returns table (
  id uuid,
  user_id uuid,
  document_type text,
  file_url text,
  storage_path text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select
    pd.id,
    pd.user_id,
    pd.document_type::text,
    pd.file_url,
    pd.storage_path,
    coalesce(pd.status::text, 'pending') as status,
    pd.created_at
  from provider_catalog.provider_profiles pp
  join provider_catalog.provider_documents pd
    on pd.user_id = pp.user_id
  where pp.id = p_provider_id
  order by pd.created_at desc nulls last;
$$;

create or replace function public.servease_admin_get_provider_application_document(
  p_provider_id uuid,
  p_document_id uuid
)
returns table (
  id uuid,
  user_id uuid,
  document_type text,
  file_url text,
  storage_path text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select
    pd.id,
    pd.user_id,
    pd.document_type::text,
    pd.file_url,
    pd.storage_path,
    coalesce(pd.status::text, 'pending') as status,
    pd.created_at
  from provider_catalog.provider_profiles pp
  join provider_catalog.provider_documents pd
    on pd.user_id = pp.user_id
  where pp.id = p_provider_id
    and pd.id = p_document_id
  limit 1;
$$;

revoke all on function public.servease_admin_list_provider_application_documents(uuid)
  from public, anon, authenticated;
revoke all on function public.servease_admin_get_provider_application_document(uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.servease_admin_list_provider_application_documents(uuid)
  to service_role;
grant execute on function public.servease_admin_get_provider_application_document(uuid, uuid)
  to service_role;
