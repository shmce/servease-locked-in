create or replace function public.servease_get_provider_availability(p_provider_id uuid)
returns jsonb
language sql
security definer
set search_path = booking, public
as $$
  select jsonb_build_object(
    'providerId', p_provider_id,
    'windows', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', w.id,
            'dayOfWeek', w.day_of_week,
            'startTime', to_char(w.start_time, 'HH24:MI'),
            'endTime', to_char(w.end_time, 'HH24:MI'),
            'isActive', coalesce(w.is_active, true),
            'sortOrder', coalesce(w.sort_order, 0)
          )
          order by coalesce(w.sort_order, 0), w.day_of_week, w.start_time
        )
        from booking.provider_availability_windows w
        where w.user_id = p_provider_id
      ),
      '[]'::jsonb
    ),
    'daysOff', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', d.id,
            'offDate', d.off_date,
            'reason', d.reason
          )
          order by d.off_date
        )
        from booking.provider_days_off d
        where d.user_id = p_provider_id
      ),
      '[]'::jsonb
    )
  );
$$;

create or replace function public.servease_replace_provider_availability_windows(
  p_provider_id uuid,
  p_windows jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = booking, public
as $$
declare
  v_window jsonb;
  v_day text;
  v_start_text text;
  v_end_text text;
  v_start time;
  v_end time;
  v_is_active boolean;
  v_sort_order integer := 0;
begin
  if jsonb_typeof(p_windows) is distinct from 'array' then
    raise exception 'invalid_availability_request';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_provider_id::text));

  delete from booking.provider_availability_windows
  where user_id = p_provider_id;

  for v_window in select * from jsonb_array_elements(p_windows)
  loop
    v_sort_order := v_sort_order + 1;
    v_day := lower(v_window ->> 'dayOfWeek');
    v_start_text := v_window ->> 'startTime';
    v_end_text := v_window ->> 'endTime';
    v_is_active := coalesce((v_window ->> 'isActive')::boolean, true);

    if v_day not in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
      or v_start_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
      or v_end_text !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    then
      raise exception 'invalid_availability_request';
    end if;

    v_start := v_start_text::time;
    v_end := v_end_text::time;

    if v_start >= v_end then
      raise exception 'invalid_availability_request';
    end if;

    insert into booking.provider_availability_windows (
      user_id,
      day_of_week,
      start_time,
      end_time,
      is_active,
      sort_order
    )
    values (
      p_provider_id,
      v_day,
      v_start,
      v_end,
      v_is_active,
      v_sort_order
    );
  end loop;

  return public.servease_get_provider_availability(p_provider_id);
end;
$$;

create or replace function public.servease_add_provider_day_off(
  p_provider_id uuid,
  p_off_date date,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  perform pg_advisory_xact_lock(hashtext(p_provider_id::text));

  delete from booking.provider_days_off
  where user_id = p_provider_id
    and off_date = p_off_date;

  insert into booking.provider_days_off (
    user_id,
    off_date,
    reason
  )
  values (
    p_provider_id,
    p_off_date,
    p_reason
  );

  return public.servease_get_provider_availability(p_provider_id);
end;
$$;

create or replace function public.servease_remove_provider_day_off(
  p_provider_id uuid,
  p_off_date date
)
returns jsonb
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  perform pg_advisory_xact_lock(hashtext(p_provider_id::text));

  delete from booking.provider_days_off
  where user_id = p_provider_id
    and off_date = p_off_date;

  return public.servease_get_provider_availability(p_provider_id);
end;
$$;

create or replace function public.servease_smoke_seed_provider_account(
  p_user_id uuid,
  p_email text
)
returns uuid
language plpgsql
security definer
set search_path = identity_and_user, provider_catalog, public
as $$
declare
  v_provider_id uuid := gen_random_uuid();
begin
  insert into identity_and_user.users (
    id,
    email,
    password_hash,
    full_name,
    contact_number,
    role,
    status
  )
  values (
    p_user_id,
    p_email,
    'managed_by_supabase_auth',
    'ServEase Smoke Provider',
    null,
    'provider',
    'active'
  )
  on conflict (id) do update set
    email = excluded.email,
    password_hash = excluded.password_hash,
    full_name = excluded.full_name,
    contact_number = excluded.contact_number,
    role = excluded.role,
    status = excluded.status,
    updated_at = now();

  delete from provider_catalog.provider_profiles
  where user_id = p_user_id;

  insert into provider_catalog.provider_profiles (
    id,
    user_id,
    business_name,
    bio,
    service_description,
    years_experience,
    service_area,
    verification_status,
    average_rating,
    review_count,
    is_active
  )
  values (
    v_provider_id,
    p_user_id,
    'Smoke Availability Provider',
    'Temporary smoke test provider',
    'Temporary smoke test services',
    3,
    'Local',
    'approved',
    4.8,
    12,
    true
  );

  return v_provider_id;
end;
$$;

create or replace function public.servease_smoke_cleanup_provider_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = identity_and_user, provider_catalog, public
as $$
begin
  delete from provider_catalog.provider_services
  where provider_id in (
    select id
    from provider_catalog.provider_profiles
    where user_id = p_user_id
  );

  delete from provider_catalog.provider_profiles
  where user_id = p_user_id;

  delete from identity_and_user.users
  where id = p_user_id;
end;
$$;

revoke all on function public.servease_get_provider_availability(uuid) from public, anon, authenticated;
revoke all on function public.servease_replace_provider_availability_windows(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.servease_add_provider_day_off(uuid, date, text) from public, anon, authenticated;
revoke all on function public.servease_remove_provider_day_off(uuid, date) from public, anon, authenticated;
revoke all on function public.servease_smoke_seed_provider_account(uuid, text) from public, anon, authenticated;
revoke all on function public.servease_smoke_cleanup_provider_account(uuid) from public, anon, authenticated;

grant execute on function public.servease_get_provider_availability(uuid) to service_role;
grant execute on function public.servease_replace_provider_availability_windows(uuid, jsonb) to service_role;
grant execute on function public.servease_add_provider_day_off(uuid, date, text) to service_role;
grant execute on function public.servease_remove_provider_day_off(uuid, date) to service_role;
grant execute on function public.servease_smoke_seed_provider_account(uuid, text) to service_role;
grant execute on function public.servease_smoke_cleanup_provider_account(uuid) to service_role;
