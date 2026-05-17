create or replace function public.servease_replace_provider_portfolio_media(
  p_user_id uuid,
  p_media_id uuid,
  p_file_url text,
  p_file_name text default null,
  p_mime_type text default null,
  p_storage_path text default null,
  p_file_size integer default null,
  p_caption text default null
)
returns table (
  id uuid,
  provider_id uuid,
  uploaded_by uuid,
  file_url text,
  file_name text,
  mime_type text,
  storage_path text,
  file_size integer,
  caption text,
  sort_order integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = provider_catalog, public
as $$
declare
  v_provider_id uuid;
begin
  if p_user_id is null or p_media_id is null or nullif(trim(coalesce(p_file_url, '')), '') is null then
    raise exception 'invalid_provider_portfolio_request';
  end if;

  select pp.id into v_provider_id
  from provider_catalog.provider_profiles pp
  where pp.user_id = p_user_id
    and coalesce(pp.is_active, true) = true
  limit 1;

  if v_provider_id is null then
    raise exception 'provider_profile_not_found';
  end if;

  return query
    update provider_catalog.provider_portfolio_media pm
    set
      uploaded_by = p_user_id,
      file_url = trim(p_file_url),
      file_name = nullif(trim(coalesce(p_file_name, '')), ''),
      mime_type = nullif(trim(coalesce(p_mime_type, '')), ''),
      storage_path = nullif(trim(coalesce(p_storage_path, '')), ''),
      file_size = p_file_size,
      caption = nullif(trim(coalesce(p_caption, '')), '')
    where pm.id = p_media_id
      and pm.provider_id = v_provider_id
    returning
      pm.id,
      pm.provider_id,
      pm.uploaded_by,
      pm.file_url,
      pm.file_name,
      pm.mime_type,
      pm.storage_path,
      pm.file_size,
      pm.caption,
      pm.sort_order,
      pm.created_at;

  if not found then
    raise exception 'provider_portfolio_media_not_found';
  end if;
end;
$$;

revoke all on function public.servease_replace_provider_portfolio_media(uuid, uuid, text, text, text, text, integer, text) from public, anon, authenticated;
grant execute on function public.servease_replace_provider_portfolio_media(uuid, uuid, text, text, text, text, integer, text) to service_role;
