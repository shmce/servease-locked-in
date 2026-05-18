-- Purpose: Let authenticated providers submit application documents through service-role RPCs.

create or replace function public.servease_submit_provider_application_document(
  p_user_id uuid,
  p_document_type text,
  p_file_url text,
  p_storage_path text
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
language plpgsql
security definer
set search_path = provider_catalog, public
as $$
begin
  if p_user_id is null or nullif(trim(p_document_type), '') is null then
    raise exception 'invalid_provider_document_request';
  end if;

  if nullif(trim(coalesce(p_file_url, '')), '') is null
    and nullif(trim(coalesce(p_storage_path, '')), '') is null then
    raise exception 'invalid_provider_document_request';
  end if;

  if not exists (
    select 1
    from provider_catalog.provider_profiles pp
    where pp.user_id = p_user_id
  ) then
    raise exception 'provider_application_not_found';
  end if;

  return query
  insert into provider_catalog.provider_documents (
    user_id,
    document_type,
    file_url,
    storage_path,
    status
  )
  values (
    p_user_id,
    trim(p_document_type),
    nullif(trim(coalesce(p_file_url, '')), ''),
    nullif(trim(coalesce(p_storage_path, '')), ''),
    'pending'
  )
  returning
    provider_documents.id,
    provider_documents.user_id,
    provider_documents.document_type,
    provider_documents.file_url,
    provider_documents.storage_path,
    provider_documents.status,
    provider_documents.created_at;
end;
$$;

revoke all on function public.servease_submit_provider_application_document(
  uuid,
  text,
  text,
  text
) from public, anon, authenticated;
grant execute on function public.servease_submit_provider_application_document(
  uuid,
  text,
  text,
  text
) to service_role;
