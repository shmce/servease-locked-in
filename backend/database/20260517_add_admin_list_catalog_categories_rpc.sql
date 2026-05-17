-- Owner: Catalog Service
-- Purpose: Backs the admin Categories list. The catalog-service
-- supabase-admin-catalog repository calls `servease_admin_list_catalog_categories`
-- but the function was never created, so /v1/admin/catalog/categories was
-- failing with catalog_service_unavailable.

create or replace function public.servease_admin_list_catalog_categories()
returns table (
  id uuid,
  name text,
  description text,
  icon text,
  is_active boolean,
  sort_order integer
)
language plpgsql
security definer
set search_path = public, provider_catalog
as $$
begin
  return query
  select
    c.id,
    c.name,
    c.description,
    c.icon,
    coalesce(c.is_active, true) as is_active,
    coalesce(c.sort_order, 0) as sort_order
  from provider_catalog.service_categories c
  order by coalesce(c.sort_order, 0), c.name;
end;
$$;

revoke all on function public.servease_admin_list_catalog_categories() from public;
grant execute on function public.servease_admin_list_catalog_categories() to service_role;
