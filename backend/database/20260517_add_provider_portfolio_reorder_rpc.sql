create or replace function public.servease_update_provider_portfolio_order(
  p_user_id uuid,
  p_items jsonb
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
  v_requested_count integer;
  v_updated_count integer;
begin
  if p_user_id is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'invalid_provider_portfolio_order_request';
  end if;

  select pp.id into v_provider_id
  from provider_catalog.provider_profiles pp
  where pp.user_id = p_user_id
    and coalesce(pp.is_active, true) = true
  limit 1;

  if v_provider_id is null then
    raise exception 'provider_profile_not_found';
  end if;

  create temporary table tmp_provider_portfolio_order(
    id uuid primary key,
    sort_order integer not null
  ) on commit drop;

  insert into tmp_provider_portfolio_order (id, sort_order)
  select x.id, x."sortOrder"
  from jsonb_to_recordset(p_items) as x(id uuid, "sortOrder" integer);

  if exists (
    select 1
    from tmp_provider_portfolio_order
    where sort_order < 0
  ) then
    raise exception 'invalid_provider_portfolio_order_request';
  end if;

  select count(*) into v_requested_count
  from tmp_provider_portfolio_order;

  update provider_catalog.provider_portfolio_media pm
  set sort_order = tmp.sort_order
  from tmp_provider_portfolio_order tmp
  where pm.id = tmp.id
    and pm.provider_id = v_provider_id;

  get diagnostics v_updated_count = row_count;

  if v_updated_count <> v_requested_count then
    raise exception 'provider_portfolio_media_not_found';
  end if;

  return query
    select
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
      pm.created_at
    from provider_catalog.provider_portfolio_media pm
    where pm.provider_id = v_provider_id
    order by pm.sort_order, pm.created_at desc nulls last
    limit 50;
end;
$$;

revoke all on function public.servease_update_provider_portfolio_order(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.servease_update_provider_portfolio_order(uuid, jsonb) to service_role;
