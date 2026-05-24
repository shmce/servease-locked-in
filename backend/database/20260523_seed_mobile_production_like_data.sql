-- Owner: platform seed tooling.
-- Purpose: reversible production-like data for mobile QA without writing app rows
-- into public tables. Public is only the service-role RPC entry point.

create extension if not exists "uuid-ossp" with schema extensions;

create or replace function public.uuid_generate_v5(namespace uuid, name text)
returns uuid
language sql
immutable
as $$
  select extensions.uuid_generate_v5(namespace, name);
$$;

revoke all on function public.uuid_generate_v5(uuid, text) from public, anon, authenticated;
grant execute on function public.uuid_generate_v5(uuid, text) to service_role;

create or replace function public.servease_cleanup_mobile_production_like_data(
  p_seed_batch_id text default 'mobile_seed_2026_05_23'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text := coalesce(nullif(trim(p_seed_batch_id), ''), 'mobile_seed_2026_05_23');
  v_result jsonb;
begin
  delete from trust_and_reputation.reviews
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':review:' || i)
    from generate_series(1, 4) as i
  );

  delete from payment.payments
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':payment:' || i)
    from generate_series(1, 10) as i
  );

  delete from notification_and_support.notifications
  where metadata->>'seedBatchId' = v_prefix
     or id in (
       select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':notification:' || i)
       from generate_series(1, 4) as i
     );

  delete from notification_and_support.support_ticket_replies
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':support-reply:' || i)
    from generate_series(1, 3) as i
  );

  delete from notification_and_support.support_tickets
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':support-ticket:' || i)
    from generate_series(1, 6) as i
  );

  delete from messages.messages
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':message:' || i)
    from generate_series(1, 16) as i
  );

  delete from messages.conversations
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':conversation:' || i)
    from generate_series(1, 4) as i
  );

  delete from booking.booking_live_locations
  where booking_id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':booking:' || i)
    from generate_series(1, 2) as i
  );

  delete from booking.booking_service_updates
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':service-update:' || i)
    from generate_series(1, 2) as i
  );

  delete from booking.booking_timeline_events
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':timeline:' || i)
    from generate_series(1, 4) as i
  );

  delete from booking.bookings
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':booking:' || i)
    from generate_series(1, 16) as i
  )
     or booking_reference like 'MOB-SEED-2026-%';

  delete from provider_catalog.provider_services
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':provider-service:' || i)
    from generate_series(1, 12) as i
  );

  delete from provider_catalog.provider_profiles
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':provider:' || i)
    from generate_series(1, 12) as i
  );

  delete from provider_catalog.services
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':service:' || i)
    from generate_series(1, 4) as i
  );

  delete from provider_catalog.service_categories
  where id in (
    select uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':category:' || i)
    from generate_series(1, 3) as i
  );

  delete from identity_and_user.user_addresses
  where id = uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':customer-address:1');

  delete from identity_and_user.customer_profiles
  where id = uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':customer-profile:1');

  delete from identity_and_user.users
  where email in (
    'mobile.customer.seed@servease.test',
    'mobile.provider.seed@servease.test',
    'mobile.admin.seed@servease.test'
  )
     or email like 'mobile.provider.__@seed.servease.test';

  v_result := jsonb_build_object(
    'seedBatchId', v_prefix,
    'cleaned', true
  );
  return v_result;
end;
$$;

create or replace function public.servease_seed_mobile_production_like_data(
  p_seed_batch_id text default 'mobile_seed_2026_05_23',
  p_customer_user_id uuid default null,
  p_provider_user_id uuid default null,
  p_admin_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text := coalesce(nullif(trim(p_seed_batch_id), ''), 'mobile_seed_2026_05_23');
  v_customer_id uuid := coalesce(p_customer_user_id, uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':customer-user:1'));
  v_provider_user_id uuid := coalesce(p_provider_user_id, uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':provider-user:1'));
  v_admin_id uuid := coalesce(p_admin_user_id, uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':admin-user:1'));
  v_provider_user_id_i uuid;
  v_provider_id uuid;
  v_booking_id uuid;
  v_service_id uuid;
  v_conversation_id uuid;
  v_message_time timestamptz;
  v_status text;
  v_amount numeric;
  v_total_rows integer := 118;
  i integer;
  j integer;
  v_service_names text[] := array['Seed Deep Home Cleaning', 'Seed AC Repair Visit', 'Seed Hair And Makeup', 'Seed Math Tutorial'];
  v_category_names text[] := array['Seed Home Care', 'Seed Repairs', 'Seed Personal Services'];
  v_booking_statuses text[] := array[
    'pending', 'confirmed', 'in_progress', 'completed',
    'completed', 'cancelled', 'confirmed', 'pending',
    'completed', 'in_progress', 'cancelled', 'completed',
    'confirmed', 'pending', 'completed', 'rejected'
  ];
begin
  perform public.servease_cleanup_mobile_production_like_data(v_prefix);

  insert into identity_and_user.users (
    id, email, password_hash, full_name, contact_number, role, status, created_at, updated_at
  )
  values
    (v_customer_id, 'mobile.customer.seed@servease.test', 'database_seed_no_auth', 'Mika Santos', '+639170010001', 'customer', 'active', now() - interval '42 days', now()),
    (v_provider_user_id, 'mobile.provider.seed@servease.test', 'database_seed_no_auth', 'Rafael Cruz', '+639170020001', 'provider', 'active', now() - interval '90 days', now()),
    (v_admin_id, 'mobile.admin.seed@servease.test', 'database_seed_no_auth', 'Mobile Seed Admin', '+639170030001', 'admin', 'active', now() - interval '120 days', now())
  on conflict (id) do update set
    email = excluded.email,
    password_hash = excluded.password_hash,
    full_name = excluded.full_name,
    contact_number = excluded.contact_number,
    role = excluded.role,
    status = excluded.status,
    updated_at = now();

  insert into identity_and_user.customer_profiles (id, user_id, address, created_at)
  values (
    uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':customer-profile:1'),
    v_customer_id,
    'Unit 12, Greenfield District, Mandaluyong City',
    now() - interval '42 days'
  );

  insert into identity_and_user.user_addresses (
    id, user_id, label, street_address, city, province, region, barangay,
    zip_code, is_default, latitude, longitude, created_at
  )
  values (
    uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':customer-address:1'),
    v_customer_id,
    'Home',
    'Unit 12, Greenfield District',
    'Mandaluyong',
    'Metro Manila',
    'NCR',
    'Highway Hills',
    '1550',
    true,
    14.5794,
    121.0561,
    now() - interval '42 days'
  );

  for i in 1..3 loop
    insert into provider_catalog.service_categories (
      id, name, description, icon, is_active, sort_order, created_at
    )
    values (
      uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':category:' || i),
      v_category_names[i],
      'Production-like mobile seed category ' || i,
      case i when 1 then 'home' when 2 then 'wrench' else 'sparkles' end,
      true,
      i,
      now() - interval '60 days'
    );
  end loop;

  for i in 1..4 loop
    insert into provider_catalog.services (
      id, category_id, name, description, price, pricing_mode, is_active, created_at
    )
    values (
      uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':service:' || i),
      uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':category:' || (((i - 1) % 3) + 1)),
      v_service_names[i],
      'Reliable ' || lower(v_service_names[i]) || ' from verified ServEase providers.',
      700 + (i * 150),
      case when i = 4 then 'hourly' else 'flat' end,
      true,
      now() - interval '60 days'
    );
  end loop;

  for i in 1..12 loop
    v_provider_user_id_i := case
      when i = 1 then v_provider_user_id
      else uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':provider-user:' || i)
    end;
    v_provider_id := uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':provider:' || i);
    v_service_id := uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':service:' || (((i - 1) % 4) + 1));

    if i > 1 then
      insert into identity_and_user.users (
        id, email, password_hash, full_name, contact_number, role, status, created_at, updated_at
      )
      values (
        v_provider_user_id_i,
        'mobile.provider.' || lpad(i::text, 2, '0') || '@seed.servease.test',
        'seeded-internal-provider',
        'Seed Provider ' || i,
        '+63917002' || lpad(i::text, 4, '0'),
        'provider',
        'active',
        now() - ((80 + i) || ' days')::interval,
        now()
      );
    end if;

    insert into provider_catalog.provider_profiles (
      id, user_id, business_name, bio, service_description, years_experience,
      service_area, languages, tags, service_radius_km, home_latitude,
      home_longitude, verification_status, average_rating, review_count,
      facebook_url, instagram_handle, website_url, is_active, created_at, updated_at
    )
    values (
      v_provider_id,
      v_provider_user_id_i,
      case when i = 1 then 'Rafael Home Services' else 'ServEase Pro ' || i end,
      'Verified mobile seed provider for QA and stakeholder demos.',
      'Production-like service provider profile seeded for mobile screens.',
      2 + (i % 8),
      case ((i - 1) % 4) when 0 then 'Mandaluyong' when 1 then 'Makati' when 2 then 'Pasig' else 'Taguig' end,
      array['English', 'Filipino'],
      array['mobile-seed', lower(replace(v_service_names[((i - 1) % 4) + 1], ' ', '-'))],
      8 + (i % 6),
      14.55 + (i::numeric / 1000),
      121.02 + (i::numeric / 1000),
      'approved',
      4.2 + ((i % 7)::numeric / 10),
      6 + i,
      null,
      '@servease_seed_' || i,
      null,
      true,
      now() - ((80 + i) || ' days')::interval,
      now()
    );

    insert into provider_catalog.provider_services (
      id, provider_id, service_id, title, description, price, pricing_mode,
      hourly_rate, flat_rate, is_active, created_at
    )
    values (
      uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':provider-service:' || i),
      v_provider_id,
      v_service_id,
      v_service_names[((i - 1) % 4) + 1],
      'Production-like listing for mobile browse and booking QA.',
      850 + (i * 75),
      case when ((i - 1) % 4) + 1 = 4 then 'hourly' else 'flat' end,
      case when ((i - 1) % 4) + 1 = 4 then 450 + (i * 20) else null end,
      case when ((i - 1) % 4) + 1 = 4 then null else 850 + (i * 75) end,
      true,
      now() - interval '45 days'
    );
  end loop;

  for i in 1..16 loop
    v_booking_id := uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':booking:' || i);
    v_provider_id := uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':provider:' || (((i - 1) % 12) + 1));
    v_service_id := uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':service:' || (((i - 1) % 4) + 1));
    v_status := v_booking_statuses[i];
    v_amount := 900 + (i * 80);

    insert into booking.bookings (
      id, booking_reference, customer_id, provider_id, service_id, service_title,
      service_name, service_description, service_address, service_location_type,
      scheduled_at, hours_required, service_amount, additional_amount,
      total_amount, pricing_mode, hourly_rate, flat_rate, payment_method,
      customer_notes, service_latitude, service_longitude, pricing_snapshot,
      status, cancel_reason, cancel_explanation, cancelled_at, started_at,
      completed_at, created_at, updated_at, quote_fairness_status, quote_confidence
    )
    values (
      v_booking_id,
      'MOB-SEED-2026-' || lpad(i::text, 3, '0'),
      v_customer_id,
      v_provider_id,
      v_service_id,
      v_service_names[((i - 1) % 4) + 1],
      v_service_names[((i - 1) % 4) + 1],
      'Production-like booking for mobile QA.',
      case (i % 4) when 0 then 'BGC, Taguig' when 1 then 'Greenfield, Mandaluyong' when 2 then 'Poblacion, Makati' else 'Kapitolyo, Pasig' end,
      'mobile',
      now() + ((i - 8) || ' days')::interval,
      1 + (i % 3),
      v_amount,
      case when i % 5 = 0 then 120 else 0 end,
      v_amount + case when i % 5 = 0 then 120 else 0 end,
      case when ((i - 1) % 4) + 1 = 4 then 'hourly' else 'flat' end,
      case when ((i - 1) % 4) + 1 = 4 then 450 else null end,
      case when ((i - 1) % 4) + 1 = 4 then null else v_amount end,
      case when i % 3 = 0 then 'card' else 'cash_on_service' end,
      'Seeded mobile QA note for booking ' || i,
      14.55 + (i::numeric / 1000),
      121.02 + (i::numeric / 1000),
      jsonb_build_object('seedBatchId', v_prefix, 'quote', v_amount),
      v_status,
      case when v_status = 'cancelled' then 'schedule_conflict' else null end,
      case when v_status = 'cancelled' then 'Production-like seeded cancellation.' else null end,
      case when v_status = 'cancelled' then now() - interval '1 day' else null end,
      case when v_status in ('in_progress', 'completed') then now() - interval '3 hours' else null end,
      case when v_status = 'completed' then now() - interval '1 hour' else null end,
      now() - ((20 - i) || ' days')::interval,
      now(),
      case when i % 6 = 0 then 'review' else 'fair' end,
      case when i % 6 = 0 then 'medium' else 'high' end
    );

    if i <= 4 then
      insert into booking.booking_timeline_events (
        id, booking_id, event_type, label, icon, created_at
      )
      values (
        uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':timeline:' || i),
        v_booking_id,
        case i when 1 then 'created' when 2 then 'confirmed' when 3 then 'provider_started' else 'completed' end,
        case i when 1 then 'Booking created' when 2 then 'Provider confirmed' when 3 then 'Provider started service' else 'Service completed' end,
        case i when 1 then 'calendar' when 2 then 'check' when 3 then 'navigation' else 'receipt' end,
        now() - ((5 - i) || ' hours')::interval
      );
    end if;

    if i <= 2 then
      insert into booking.booking_service_updates (
        id, booking_id, actor_id, update_type, message, checklist, created_at
      )
      values (
        uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':service-update:' || i),
        v_booking_id,
        v_provider_user_id,
        case i when 1 then 'checklist' else 'progress' end,
        case i when 1 then 'Provider is on the way.' else 'Service is in progress.' end,
        jsonb_build_array(
          jsonb_build_object('label', 'Materials checked', 'done', true),
          jsonb_build_object('label', 'Customer brief reviewed', 'done', true)
        ),
        now() - ((3 - i) || ' hours')::interval
      );

      insert into booking.booking_live_locations (
        booking_id, provider_id, latitude, longitude, accuracy_meters,
        heading_degrees, speed_mps, created_at, updated_at
      )
      values (
        v_booking_id,
        v_provider_id,
        14.57 + (i::double precision / 1000),
        121.05 + (i::double precision / 1000),
        15 + i,
        40 + i,
        1.1 + (i::double precision / 10),
        now() - interval '10 minutes',
        now() - interval '2 minutes'
      );
    end if;
  end loop;

  for i in 1..4 loop
    v_booking_id := uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':booking:' || i);
    v_provider_id := uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':provider:' || i);
    v_conversation_id := uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':conversation:' || i);
    v_message_time := now() - ((8 - i) || ' hours')::interval;

    insert into messages.conversations (
      id, booking_id, customer_id, provider_id, last_message_at, created_at
    )
    values (
      v_conversation_id,
      v_booking_id,
      v_customer_id,
      v_provider_id,
      v_message_time + interval '12 minutes',
      v_message_time
    );

    for j in 1..4 loop
      insert into messages.messages (
        id, conversation_id, sender_id, sender_role, content, delivery_status, created_at
      )
      values (
        uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':message:' || (((i - 1) * 4) + j)),
        v_conversation_id,
        case when j % 2 = 1 then v_customer_id else v_provider_user_id end,
        case when j % 2 = 1 then 'customer' else 'provider' end,
        case j
          when 1 then 'Hi, confirming the service schedule.'
          when 2 then 'Confirmed. I will arrive within the selected window.'
          when 3 then 'Thanks. Please message when you are nearby.'
          else 'I am nearby and preparing the tools now.'
        end,
        'sent',
        v_message_time + ((j * 4) || ' minutes')::interval
      );
    end loop;
  end loop;

  for i in 1..10 loop
    v_booking_id := uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':booking:' || i);
    v_provider_id := uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':provider:' || (((i - 1) % 12) + 1));
    v_amount := 900 + (i * 80);

    insert into payment.payments (
      id, booking_id, customer_id, provider_id, amount, platform_fee,
      provider_payout, status, payment_method, paid_at, created_at
    )
    values (
      uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':payment:' || i),
      v_booking_id,
      v_customer_id,
      v_provider_id,
      v_amount,
      round(v_amount * 0.12, 2),
      round(v_amount * 0.88, 2),
      case when i in (4,5,9) then 'paid' when i = 6 then 'cancelled' when i = 10 then 'refunded' else 'pending' end,
      case when i % 3 = 0 then 'card' else 'cash_on_service' end,
      case when i in (4,5,9,10) then now() - interval '1 day' else null end,
      now() - ((15 - i) || ' days')::interval
    );
  end loop;

  for i in 1..6 loop
    insert into notification_and_support.support_tickets (
      id, user_id, subject, message, category, status, created_at, assignee_id
    )
    values (
      uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':support-ticket:' || i),
      v_customer_id,
      case when i % 2 = 0 then 'Booking issue: MOB-SEED-2026-' || lpad(i::text, 3, '0') else 'Question about seeded booking ' || i end,
      'Booking: ' || uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':booking:' || i)::text || E'\nReference: MOB-SEED-2026-' || lpad(i::text, 3, '0') || E'\n\nProduction-like support context for mobile QA.',
      case when i % 2 = 0 then 'booking_issue' else 'general' end,
      case when i in (1, 2) then 'open' when i in (3, 4) then 'in_progress' when i = 5 then 'resolved' else 'closed' end,
      now() - ((10 - i) || ' days')::interval,
      case when i in (3, 4, 5, 6) then v_admin_id else null end
    );

    if i <= 3 then
      insert into notification_and_support.support_ticket_replies (
        id, ticket_id, replied_by, message, created_at
      )
      values (
        uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':support-reply:' || i),
        uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':support-ticket:' || i),
        case when i = 1 then v_customer_id else v_admin_id end,
        case when i = 1 then 'Adding more detail for support.' else 'Support is reviewing this seeded case.' end,
        now() - ((7 - i) || ' days')::interval
      );
    end if;
  end loop;

  for i in 1..4 loop
    insert into notification_and_support.notifications (
      id, user_id, type, title, body, is_read, metadata, created_at
    )
    values (
      uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':notification:' || i),
      case when i % 2 = 0 then v_provider_user_id else v_customer_id end,
      case i when 1 then 'booking_confirmed' when 2 then 'admin_provider_message' when 3 then 'support_reply' else 'payment_update' end,
      case i when 1 then 'Booking confirmed' when 2 then 'Message from ServEase admin' when 3 then 'Support team replied' else 'Payment update' end,
      case i when 1 then 'Your seeded booking has been confirmed.' when 2 then 'Please review a support follow-up.' when 3 then 'The support team added a reply.' else 'A seeded payment status changed.' end,
      i = 4,
      jsonb_build_object(
        'seedBatchId', v_prefix,
        'bookingId', uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':booking:' || i),
        'bookingReference', 'MOB-SEED-2026-' || lpad(i::text, 3, '0')
      ),
      now() - ((5 - i) || ' hours')::interval
    );
  end loop;

  for i in 1..4 loop
    insert into trust_and_reputation.reviews (
      id, booking_id, provider_id, reviewer_id, rating, review_text, is_flagged, created_at
    )
    values (
      uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':review:' || i),
      uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':booking:' || (case i when 1 then 4 when 2 then 5 when 3 then 9 else 12 end)),
      uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, v_prefix || ':provider:' || i),
      v_customer_id,
      case i when 1 then 5 when 2 then 4 when 3 then 5 else 4 end,
      case i when 1 then 'Arrived on time and explained each step.' when 2 then 'Good quality work and clear updates.' when 3 then 'Very responsive provider.' else 'Smooth service experience.' end,
      false,
      now() - ((4 - i) || ' days')::interval
    );
  end loop;

  return jsonb_build_object(
    'seedBatchId', v_prefix,
    'seeded', true,
    'totalRows', v_total_rows,
    'databaseOnly', true,
    'demoUsers', jsonb_build_object(
      'customer', 'mobile.customer.seed@servease.test',
      'provider', 'mobile.provider.seed@servease.test',
      'admin', 'mobile.admin.seed@servease.test'
    ),
    'tableCounts', jsonb_build_object(
      'identity_and_user.users', 14,
      'identity_and_user.customer_profiles', 1,
      'identity_and_user.user_addresses', 1,
      'provider_catalog.service_categories', 3,
      'provider_catalog.services', 4,
      'provider_catalog.provider_profiles', 12,
      'provider_catalog.provider_services', 12,
      'booking.bookings', 16,
      'booking.booking_timeline_events', 4,
      'booking.booking_service_updates', 2,
      'booking.booking_live_locations', 2,
      'messages.conversations', 4,
      'messages.messages', 16,
      'notification_and_support.notifications', 4,
      'notification_and_support.support_tickets', 6,
      'notification_and_support.support_ticket_replies', 3,
      'payment.payments', 10,
      'trust_and_reputation.reviews', 4
    )
  );
end;
$$;

revoke all on function public.servease_seed_mobile_production_like_data(text, uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_cleanup_mobile_production_like_data(text) from public, anon, authenticated;

grant execute on function public.servease_seed_mobile_production_like_data(text, uuid, uuid, uuid) to service_role;
grant execute on function public.servease_cleanup_mobile_production_like_data(text) to service_role;
