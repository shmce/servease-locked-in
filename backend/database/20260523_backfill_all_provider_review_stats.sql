do $$
declare
  v_provider_id uuid;
begin
  for v_provider_id in
    select pp.id
    from provider_catalog.provider_profiles pp
  loop
    perform public.servease_refresh_provider_review_stats(v_provider_id);
  end loop;
end;
$$;
