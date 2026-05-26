-- Owner: platform analytics tooling.
-- Purpose: reversible analytics-grade production-like data so the embedded Looker
-- Studio report (and any other BI consumer of the Supabase Postgres) renders
-- meaningful trends, cohorts, funnels, and provider-quality shapes.
-- Public is only the service-role RPC entry point.
--
-- Volumes (defaults): ~14k rows, spread over ~365 days.
--   200 customers, 50 providers, 1 admin (251 users)
--   6 categories, 18 services, 50 provider profiles, ~180 provider services
--   ~3,000 bookings (status mix correlated with booking age)
--   ~2,700 payments (one per non-rejected booking, status correlated)
--   ~1,500 reviews (~85% of completed bookings)
--   ~600 conversations + ~4,500 messages (sampled bookings)
--   ~120 support tickets + ~150 replies
--   ~800 notifications
--
-- All rows are tagged so cleanup is bullet-proof:
--   users.email ILIKE 'analytics.%@seed.servease.test'
--   service_categories.name LIKE '[<batch>] %'
--   services.name LIKE '[<batch>] %'
--   provider_profiles.business_name LIKE '[<batch>] %'
--   bookings.booking_reference LIKE '<batch>-%'
--   support_tickets.subject LIKE '[<batch>] %'
--   notifications.metadata->>seedBatchId = <batch>

create extension if not exists "uuid-ossp" with schema extensions;

create or replace function public.servease_cleanup_analytics_production_like_data(
  p_seed_batch_id text default 'analytics_seed_2026_05_23'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text := coalesce(nullif(trim(p_seed_batch_id), ''), 'analytics_seed_2026_05_23');
  v_email_pattern text := 'analytics.%@seed.servease.test';
  v_tag_pattern text := '[' || v_prefix || ']%';
  v_booking_pattern text := v_prefix || '-%';
  v_payout_idem_pattern text := v_prefix || ':%';
begin
  -- Order matters: delete leaves before roots, respect FK chains.

  -- Payout chain first (events -> payouts -> methods).
  delete from payment.provider_payout_events
   where payout_id in (
     select id from payment.provider_payouts where idempotency_key like v_payout_idem_pattern
   );
  delete from payment.provider_payouts
   where idempotency_key like v_payout_idem_pattern;
  delete from payment.provider_payout_methods
   where account_label like v_tag_pattern;

  delete from trust_and_reputation.reviews
   where booking_id in (
     select id from booking.bookings where booking_reference like v_booking_pattern
   );

  delete from payment.payments
   where booking_id in (
     select id from booking.bookings where booking_reference like v_booking_pattern
   );

  delete from notification_and_support.support_ticket_replies
   where ticket_id in (
     select id from notification_and_support.support_tickets
      where subject like v_tag_pattern
   );

  delete from notification_and_support.support_tickets
   where subject like v_tag_pattern;

  delete from notification_and_support.notifications
   where metadata ->> 'seedBatchId' = v_prefix;

  delete from messages.messages
   where conversation_id in (
     select id from messages.conversations
      where booking_id in (
        select id from booking.bookings where booking_reference like v_booking_pattern
      )
   );

  delete from messages.conversations
   where booking_id in (
     select id from booking.bookings where booking_reference like v_booking_pattern
   );

  delete from booking.booking_timeline_events
   where booking_id in (
     select id from booking.bookings where booking_reference like v_booking_pattern
   );

  delete from booking.bookings
   where booking_reference like v_booking_pattern;

  delete from provider_catalog.provider_services
   where provider_id in (
     select id from provider_catalog.provider_profiles
      where business_name like v_tag_pattern
   );

  delete from provider_catalog.provider_profiles
   where business_name like v_tag_pattern;

  delete from provider_catalog.services
   where name like v_tag_pattern;

  delete from provider_catalog.service_categories
   where name like v_tag_pattern;

  delete from identity_and_user.user_addresses
   where user_id in (
     select id from identity_and_user.users where email like v_email_pattern
   );

  delete from identity_and_user.customer_profiles
   where user_id in (
     select id from identity_and_user.users where email like v_email_pattern
   );

  delete from identity_and_user.users
   where email like v_email_pattern;

  return jsonb_build_object(
    'seedBatchId', v_prefix,
    'cleaned', true
  );
end;
$$;

create or replace function public.servease_seed_analytics_production_like_data(
  p_seed_batch_id text default 'analytics_seed_2026_05_23',
  p_total_customers int default 200,
  p_total_providers int default 50,
  p_total_bookings int default 3000,
  p_months_of_history int default 12
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text := coalesce(nullif(trim(p_seed_batch_id), ''), 'analytics_seed_2026_05_23');
  v_tag text := '[' || v_prefix || ']';
  v_ns uuid := '6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid;
  v_admin_id uuid := uuid_generate_v5(v_ns, v_prefix || ':admin-user:1');
  v_days int := greatest(30, p_months_of_history * 30);

  v_total_customers int := greatest(1, p_total_customers);
  v_total_providers int := greatest(1, p_total_providers);
  v_total_bookings int := greatest(1, p_total_bookings);

  v_first_names text[] := array[
    'Mika','Andres','Liza','Joel','Carmen','Ramon','Beatrice','Diego','Sofia','Marco',
    'Luna','Kiko','Yna','Paco','Bea','Nico','Aira','Erwin','Mara','Tonio',
    'Rica','Vince','Lara','Ferdie','Issa','Migs','Trina','Karl','Patty','Bryan'
  ];
  v_last_names text[] := array[
    'Santos','Cruz','Reyes','Garcia','Mendoza','Torres','Rivera','Aquino',
    'Delos Santos','Bautista','Domingo','Tan','Lim','Ong','Villanueva',
    'Castillo','Navarro','Pascual','Salazar','Ramos'
  ];
  v_cities text[] := array['Makati','Mandaluyong','Pasig','Taguig','Quezon City','Manila','Pasay','Marikina','San Juan','Paranaque'];
  v_category_names text[] := array['Home Care','Repairs','Personal Services','Tutoring','Wellness','Events'];
  v_service_pool text[] := array[
    'Deep Home Cleaning','Aircon Cleaning','Laundry Pickup',
    'Aircon Repair','Plumbing Visit','Appliance Repair',
    'Hair & Makeup','Personal Styling','Pet Grooming',
    'Math Tutorial','Language Coaching','Coding Lessons',
    'Therapeutic Massage','In-home Yoga','Wellness Consult',
    'Event Setup','Birthday Hosting','Photo Coverage'
  ];
  v_service_categories int[] := array[1,1,1, 2,2,2, 3,3,3, 4,4,4, 5,5,5, 6,6,6];
  v_pricing_mode text[]  := array['flat','hourly','flat','flat','hourly','flat','flat','hourly','flat','hourly','hourly','hourly','hourly','hourly','flat','flat','flat','flat'];

  v_result jsonb;
  v_users_count int;
  v_bookings_count int;
  v_payments_count int;
  v_reviews_count int;
  v_conversations_count int;
  v_messages_count int;
  v_tickets_count int;
  v_replies_count int;
  v_notifications_count int;
  v_provider_services_count int;
  v_addresses_count int;
begin
  perform public.servease_cleanup_analytics_production_like_data(v_prefix);

  -------------------------------------------------------------------------
  -- 1. Users (admin + customers + providers)
  -------------------------------------------------------------------------

  insert into identity_and_user.users (
    id, email, password_hash, full_name, contact_number, role, status, created_at, updated_at
  )
  values (
    v_admin_id,
    'analytics.admin.seed@seed.servease.test',
    'database_seed_no_auth',
    'Analytics Seed Admin',
    '+639170900001',
    'admin',
    'active',
    now() - interval '400 days',
    now()
  );

  insert into identity_and_user.users (
    id, email, password_hash, full_name, contact_number, role, status, created_at, updated_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':customer-user:' || i),
    'analytics.customer.' || lpad(i::text, 4, '0') || '@seed.servease.test',
    'database_seed_no_auth',
    v_first_names[((i - 1) % array_length(v_first_names, 1)) + 1]
      || ' ' || v_last_names[((i - 1) % array_length(v_last_names, 1)) + 1]
      || ' #' || lpad(i::text, 4, '0'),
    '+639' || lpad((171000000 + i)::text, 9, '0'),
    'customer',
    case
      when i % 80 = 0 then 'suspended'
      when i % 50 = 0 then 'inactive'
      else 'active'
    end,
    now() - (((v_days * (v_total_customers - i + 1)) / v_total_customers) || ' days')::interval,
    now()
  from generate_series(1, v_total_customers) as i;

  insert into identity_and_user.users (
    id, email, password_hash, full_name, contact_number, role, status, created_at, updated_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':provider-user:' || i),
    'analytics.provider.' || lpad(i::text, 3, '0') || '@seed.servease.test',
    'database_seed_no_auth',
    v_first_names[((i - 1) % array_length(v_first_names, 1)) + 1]
      || ' ' || v_last_names[((i + 5) % array_length(v_last_names, 1)) + 1]
      || ' (Pro)',
    '+639' || lpad((172000000 + i)::text, 9, '0'),
    'provider',
    case
      when i % 25 = 0 then 'suspended'
      when i % 17 = 0 then 'inactive'
      else 'active'
    end,
    now() - (((v_days + 30) * (v_total_providers - i + 1)) / v_total_providers || ' days')::interval,
    now()
  from generate_series(1, v_total_providers) as i;

  select count(*) into v_users_count
    from identity_and_user.users
   where email like 'analytics.%@seed.servease.test';

  -------------------------------------------------------------------------
  -- 2. Customer profiles + addresses
  -------------------------------------------------------------------------

  insert into identity_and_user.customer_profiles (id, user_id, address, created_at)
  select
    uuid_generate_v5(v_ns, v_prefix || ':customer-profile:' || i),
    uuid_generate_v5(v_ns, v_prefix || ':customer-user:' || i),
    'Block ' || ((i % 50) + 1) || ', ' || v_cities[((i - 1) % 10) + 1] || ', Metro Manila',
    now() - (((v_days * (v_total_customers - i + 1)) / v_total_customers) || ' days')::interval
  from generate_series(1, v_total_customers) as i;

  -- One default address per customer, plus a secondary address every 4th customer.
  insert into identity_and_user.user_addresses (
    id, user_id, label, street_address, city, province, region, barangay,
    zip_code, is_default, latitude, longitude, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':customer-address:' || i || ':home'),
    uuid_generate_v5(v_ns, v_prefix || ':customer-user:' || i),
    'Home',
    'Block ' || ((i % 50) + 1) || ', Street ' || ((i % 30) + 1),
    v_cities[((i - 1) % 10) + 1],
    'Metro Manila',
    'NCR',
    'Barangay ' || ((i % 25) + 1),
    lpad((1000 + (i % 999))::text, 4, '0'),
    true,
    14.50 + ((i % 100)::numeric / 1000),
    121.00 + ((i % 100)::numeric / 1000),
    now() - (((v_days * (v_total_customers - i + 1)) / v_total_customers) || ' days')::interval
  from generate_series(1, v_total_customers) as i;

  insert into identity_and_user.user_addresses (
    id, user_id, label, street_address, city, province, region, barangay,
    zip_code, is_default, latitude, longitude, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':customer-address:' || i || ':work'),
    uuid_generate_v5(v_ns, v_prefix || ':customer-user:' || i),
    'Work',
    'Floor ' || ((i % 30) + 1) || ', Tower ' || ((i % 12) + 1),
    v_cities[(i % 10) + 1],
    'Metro Manila',
    'NCR',
    'CBD',
    lpad((1200 + (i % 700))::text, 4, '0'),
    false,
    14.55 + ((i % 90)::numeric / 1000),
    121.03 + ((i % 90)::numeric / 1000),
    now() - (((v_days * (v_total_customers - i + 1)) / v_total_customers) || ' days')::interval
  from generate_series(1, v_total_customers) as i
  where i % 4 = 0;

  select count(*) into v_addresses_count
    from identity_and_user.user_addresses ua
    join identity_and_user.users u on u.id = ua.user_id
   where u.email like 'analytics.%@seed.servease.test';

  -------------------------------------------------------------------------
  -- 3. Service catalog (categories, services)
  -------------------------------------------------------------------------

  insert into provider_catalog.service_categories (
    id, name, description, icon, is_active, sort_order, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':category:' || i),
    v_tag || ' ' || v_category_names[i],
    'Analytics seed category (' || v_category_names[i] || ') for BI dashboards.',
    case i
      when 1 then 'home'
      when 2 then 'wrench'
      when 3 then 'sparkles'
      when 4 then 'book'
      when 5 then 'heart'
      else 'gift'
    end,
    true,
    i,
    now() - ((v_days + 60) || ' days')::interval
  from generate_series(1, 6) as i;

  insert into provider_catalog.services (
    id, category_id, name, description, price, pricing_mode, is_active, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':service:' || i),
    uuid_generate_v5(v_ns, v_prefix || ':category:' || v_service_categories[i]),
    v_tag || ' ' || v_service_pool[i],
    'Production-like analytics seed listing: ' || lower(v_service_pool[i]) || '.',
    400 + (i * 75),
    v_pricing_mode[i],
    true,
    now() - ((v_days + 30) || ' days')::interval
  from generate_series(1, 18) as i;

  -------------------------------------------------------------------------
  -- 4. Provider profiles + provider services
  -------------------------------------------------------------------------

  insert into provider_catalog.provider_profiles (
    id, user_id, business_name, bio, service_description, years_experience,
    service_area, languages, tags, service_radius_km, home_latitude,
    home_longitude, verification_status, average_rating, review_count,
    facebook_url, instagram_handle, website_url, is_active, created_at, updated_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':provider:' || i),
    uuid_generate_v5(v_ns, v_prefix || ':provider-user:' || i),
    v_tag || ' ' || (case (i % 6)
      when 0 then 'Reliable'
      when 1 then 'Premium'
      when 2 then 'Trusted'
      when 3 then 'Quick'
      when 4 then 'Friendly'
      else 'Skilled'
    end) || ' ' || v_service_pool[((i - 1) % 18) + 1] || ' Pro #' || lpad(i::text, 3, '0'),
    'Verified analytics seed provider supporting BI demos and trend reporting.',
    'Production-like service provider profile, distributed across categories and cities.',
    1 + (i % 15),
    v_cities[((i - 1) % 10) + 1],
    array['English','Filipino'],
    array['analytics-seed', lower(replace(v_service_pool[((i - 1) % 18) + 1], ' ', '-'))],
    5 + (i % 20),
    14.50 + ((i % 100)::numeric / 1000),
    121.00 + ((i % 100)::numeric / 1000),
    case
      when i % 18 = 0 then 'pending'
      when i % 23 = 0 then 'rejected'
      else 'approved'
    end,
    -- pre-fill average rating; backfill job can refresh later
    round((3.5 + ((i % 16)::numeric / 10))::numeric, 2),
    5 + (i % 30),
    null,
    '@servease_analytics_' || lpad(i::text, 3, '0'),
    null,
    case when i % 25 = 0 then false else true end,
    now() - (((v_days + 30) * (v_total_providers - i + 1)) / v_total_providers || ' days')::interval,
    now()
  from generate_series(1, v_total_providers) as i;

  -- Each provider offers 3 services (deterministic: services i, i+1, i+2 of pool).
  insert into provider_catalog.provider_services (
    id, provider_id, service_id, title, description, price, pricing_mode,
    hourly_rate, flat_rate, is_active, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':provider-service:' || p || ':' || s),
    uuid_generate_v5(v_ns, v_prefix || ':provider:' || p),
    uuid_generate_v5(v_ns, v_prefix || ':service:' || (((p + s - 2) % 18) + 1)),
    v_service_pool[((p + s - 2) % 18) + 1],
    'Analytics seed listing distributed across providers and services.',
    500 + ((p * 30 + s * 75) % 2000),
    v_pricing_mode[((p + s - 2) % 18) + 1],
    case when v_pricing_mode[((p + s - 2) % 18) + 1] = 'hourly'
      then 300 + ((p * 10 + s * 25) % 600)
      else null end,
    case when v_pricing_mode[((p + s - 2) % 18) + 1] = 'flat'
      then 500 + ((p * 30 + s * 75) % 2000)
      else null end,
    true,
    now() - (((v_days + 20) * (v_total_providers - p + 1)) / v_total_providers || ' days')::interval
  from generate_series(1, v_total_providers) as p
  cross join generate_series(1, 3) as s;

  select count(*) into v_provider_services_count
    from provider_catalog.provider_services ps
    join provider_catalog.provider_profiles pp on pp.id = ps.provider_id
   where pp.business_name like v_tag || '%';

  -------------------------------------------------------------------------
  -- 5. Bookings (the big one)
  --    - offset_days: linear from oldest (i=1) to today (i=N)
  --    - status: depends on age (older -> completed/cancelled, newer -> pending)
  --    - amount: varies by service index
  -------------------------------------------------------------------------

  with booking_input as (
    select
      i,
      uuid_generate_v5(v_ns, v_prefix || ':booking:' || i) as booking_id,
      ((i - 1) % v_total_customers) + 1 as cust_idx,
      ((i - 1) % v_total_providers) + 1 as prov_idx,
      ((i - 1) % 18) + 1 as svc_idx,
      ((v_days * (v_total_bookings - i + 1)) / v_total_bookings) as offset_days
    from generate_series(1, v_total_bookings) as i
  ),
  booking_with_status as (
    select
      bi.*,
      case
        -- aged > 14 days: terminal states (completed/cancelled/rejected) dominate
        when bi.offset_days > 14 then
          case (bi.i * 7) % 100
            when 0 then 'rejected'
            when 1 then 'rejected'
            when 2 then 'cancelled'
            when 3 then 'cancelled'
            when 4 then 'cancelled'
            when 5 then 'cancelled'
            when 6 then 'cancelled'
            when 7 then 'cancelled'
            when 8 then 'cancelled'
            when 9 then 'cancelled'
            when 10 then 'cancelled'
            when 11 then 'cancelled'
            when 12 then 'cancelled'
            when 13 then 'cancelled'
            when 14 then 'cancelled'
            when 15 then 'cancelled'
            when 16 then 'cancelled'
            when 17 then 'cancelled'
            when 18 then 'cancelled'
            when 19 then 'cancelled'
            when 20 then 'in_progress'
            when 21 then 'in_progress'
            when 22 then 'in_progress'
            when 23 then 'confirmed'
            when 24 then 'confirmed'
            else 'completed'
          end
        -- mid (4..14 days): mix of completed/confirmed/in_progress/cancelled
        when bi.offset_days > 3 then
          case (bi.i * 7) % 10
            when 0 then 'cancelled'
            when 1 then 'rejected'
            when 2 then 'in_progress'
            when 3 then 'in_progress'
            when 4 then 'confirmed'
            when 5 then 'confirmed'
            when 6 then 'completed'
            when 7 then 'completed'
            when 8 then 'completed'
            else 'completed'
          end
        -- recent (<=3 days): pending/confirmed dominate
        else
          case (bi.i * 7) % 10
            when 0 then 'cancelled'
            when 1 then 'pending'
            when 2 then 'pending'
            when 3 then 'pending'
            when 4 then 'pending'
            when 5 then 'confirmed'
            when 6 then 'confirmed'
            when 7 then 'confirmed'
            when 8 then 'in_progress'
            else 'in_progress'
          end
      end as status
    from booking_input bi
  )
  insert into booking.bookings (
    id, booking_reference, customer_id, provider_id, service_id, service_title,
    service_name, service_description, service_address, service_location_type,
    scheduled_at, hours_required, service_amount, additional_amount,
    total_amount, pricing_mode, hourly_rate, flat_rate, payment_method,
    customer_notes, service_latitude, service_longitude, pricing_snapshot,
    status, cancel_reason, cancel_explanation, cancelled_at, started_at,
    completed_at, created_at, updated_at, quote_fairness_status, quote_confidence
  )
  select
    bws.booking_id,
    v_prefix || '-' || lpad(bws.i::text, 5, '0'),
    uuid_generate_v5(v_ns, v_prefix || ':customer-user:' || bws.cust_idx),
    uuid_generate_v5(v_ns, v_prefix || ':provider:' || bws.prov_idx),
    uuid_generate_v5(v_ns, v_prefix || ':service:' || bws.svc_idx),
    v_service_pool[bws.svc_idx],
    v_service_pool[bws.svc_idx],
    'Analytics seed booking #' || bws.i,
    v_cities[((bws.i - 1) % 10) + 1] || ', Metro Manila',
    'mobile',
    -- scheduled = created + 1-7 days
    now() - (bws.offset_days || ' days')::interval + (((bws.i % 7) + 1) || ' days')::interval,
    1 + (bws.i % 4),
    400 + ((bws.svc_idx * 75) + (bws.i % 1500)),
    case when bws.i % 7 = 0 then 100 + ((bws.i % 5) * 50) else 0 end,
    (400 + ((bws.svc_idx * 75) + (bws.i % 1500)))
      + (case when bws.i % 7 = 0 then 100 + ((bws.i % 5) * 50) else 0 end),
    v_pricing_mode[bws.svc_idx],
    case when v_pricing_mode[bws.svc_idx] = 'hourly' then 300 + ((bws.i * 11) % 400) else null end,
    case when v_pricing_mode[bws.svc_idx] = 'flat' then 400 + ((bws.svc_idx * 75) + (bws.i % 1500)) else null end,
    case (bws.i % 5)
      when 0 then 'card'
      when 1 then 'gcash'
      when 2 then 'card'
      else 'cash_on_service'
    end,
    'Seeded analytics-grade booking note ' || bws.i,
    14.50 + ((bws.i % 100)::numeric / 1000),
    121.00 + ((bws.i % 100)::numeric / 1000),
    jsonb_build_object('seedBatchId', v_prefix, 'index', bws.i),
    bws.status,
    case when bws.status in ('cancelled','rejected') then 'schedule_conflict' else null end,
    case when bws.status in ('cancelled','rejected') then 'Analytics seed: synthetic cancellation/rejection.' else null end,
    case when bws.status in ('cancelled','rejected')
      then now() - (bws.offset_days || ' days')::interval + interval '1 hour'
      else null end,
    case when bws.status in ('in_progress','completed')
      then now() - (bws.offset_days || ' days')::interval + interval '12 hours'
      else null end,
    case when bws.status = 'completed'
      then now() - (bws.offset_days || ' days')::interval + interval '14 hours'
      else null end,
    now() - (bws.offset_days || ' days')::interval,
    now() - (bws.offset_days || ' days')::interval,
    case when bws.i % 9 = 0 then 'review' else 'fair' end,
    case (bws.i % 3) when 0 then 'high' when 1 then 'medium' else 'high' end
  from booking_with_status bws;

  select count(*) into v_bookings_count
    from booking.bookings
   where booking_reference like v_prefix || '-%';

  -------------------------------------------------------------------------
  -- 6. Payments — one per booking EXCEPT pending/rejected (no charge yet)
  --    Status correlated with booking status.
  -------------------------------------------------------------------------

  insert into payment.payments (
    id, booking_id, customer_id, provider_id, amount, platform_fee,
    provider_payout, status, payment_method, paid_at, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':payment:' || b.booking_reference),
    b.id,
    b.customer_id,
    b.provider_id,
    b.total_amount,
    round(b.total_amount * 0.12, 2),
    round(b.total_amount * 0.88, 2),
    case b.status
      when 'completed' then 'paid'
      when 'in_progress' then case when (extract(epoch from b.created_at)::bigint % 5) = 0 then 'paid' else 'pending' end
      when 'confirmed'  then 'pending'
      when 'cancelled'  then case when (extract(epoch from b.created_at)::bigint % 3) = 0 then 'refunded' else 'cancelled' end
      else 'pending'
    end,
    b.payment_method,
    case when b.status in ('completed') then b.completed_at
         when b.status in ('cancelled') and (extract(epoch from b.created_at)::bigint % 3) = 0 then b.cancelled_at
         else null end,
    b.created_at
  from booking.bookings b
   where b.booking_reference like v_prefix || '-%'
     and b.status not in ('pending','rejected');

  select count(*) into v_payments_count
    from payment.payments p
    join booking.bookings b on b.id = p.booking_id
   where b.booking_reference like v_prefix || '-%';

  -------------------------------------------------------------------------
  -- 7. Reviews — ~85% of completed bookings (deterministic), ratings skewed high.
  -------------------------------------------------------------------------

  insert into trust_and_reputation.reviews (
    id, booking_id, provider_id, reviewer_id, rating, review_text, is_flagged, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':review:' || b.booking_reference),
    b.id,
    b.provider_id,
    b.customer_id,
    case (abs(hashtext(b.booking_reference)) % 100)
      when 0 then 1
      when 1 then 2
      when 2 then 2
      when 3 then 3
      when 4 then 3
      when 5 then 3
      when 6 then 3
      when 7 then 3
      when 8 then 3
      when 9 then 3
      else case when (abs(hashtext(b.booking_reference)) % 100) < 35 then 4 else 5 end
    end,
    (array[
      'Arrived on time and explained each step.',
      'Good quality work and clear updates.',
      'Very responsive provider. Would book again.',
      'Smooth service experience.',
      'Professional and friendly.',
      'Service was okay, room for improvement.',
      'Took longer than expected but the result was great.',
      'Excellent communication throughout.',
      'Did exactly what we needed.',
      'Will recommend to friends.'
    ])[(abs(hashtext(b.booking_reference)) % 10) + 1],
    false,
    coalesce(b.completed_at, b.created_at) + interval '1 day'
  from booking.bookings b
   where b.booking_reference like v_prefix || '-%'
     and b.status = 'completed'
     and (abs(hashtext(b.booking_reference)) % 100) < 85;

  select count(*) into v_reviews_count
    from trust_and_reputation.reviews r
    join booking.bookings b on b.id = r.booking_id
   where b.booking_reference like v_prefix || '-%';

  -------------------------------------------------------------------------
  -- 8. Conversations + messages — sample ~20% of bookings.
  -------------------------------------------------------------------------

  insert into messages.conversations (
    id, booking_id, customer_id, provider_id, last_message_at, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':conversation:' || b.booking_reference),
    b.id,
    b.customer_id,
    b.provider_id,
    b.created_at + interval '20 minutes',
    b.created_at
  from booking.bookings b
   where b.booking_reference like v_prefix || '-%'
     and (abs(hashtext(b.booking_reference)) % 5) = 0;

  select count(*) into v_conversations_count
    from messages.conversations c
    join booking.bookings b on b.id = c.booking_id
   where b.booking_reference like v_prefix || '-%';

  -- 7 messages per conversation, alternating sender.
  insert into messages.messages (
    id, conversation_id, sender_id, sender_role, content, delivery_status, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':message:' || c.id::text || ':' || g),
    c.id,
    case when g % 2 = 1 then c.customer_id
         else (select user_id from provider_catalog.provider_profiles pp where pp.id = c.provider_id) end,
    case when g % 2 = 1 then 'customer' else 'provider' end,
    (array[
      'Hi, confirming our service schedule.',
      'Confirmed. Will arrive within the window.',
      'Thanks. Please message when nearby.',
      'I''m on the way now.',
      'Almost there, 5 minutes out.',
      'Service started, thanks for the access.',
      'Wrapping up now, will send a summary shortly.'
    ])[g],
    'sent',
    c.created_at + ((g * 3) || ' minutes')::interval
  from messages.conversations c
  join booking.bookings b on b.id = c.booking_id
  cross join generate_series(1, 7) as g
  where b.booking_reference like v_prefix || '-%';

  select count(*) into v_messages_count
    from messages.messages m
    join messages.conversations c on c.id = m.conversation_id
    join booking.bookings b on b.id = c.booking_id
   where b.booking_reference like v_prefix || '-%';

  -------------------------------------------------------------------------
  -- 9. Support tickets — 120 spread over history; ~half get a reply.
  -------------------------------------------------------------------------

  insert into notification_and_support.support_tickets (
    id, user_id, subject, message, category, status, created_at, assignee_id
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':support-ticket:' || i),
    uuid_generate_v5(v_ns, v_prefix || ':customer-user:' || (((i - 1) % v_total_customers) + 1)),
    v_tag || ' '
      || (case (i % 4)
            when 0 then 'Booking issue '
            when 1 then 'Refund request '
            when 2 then 'Account question '
            else 'Provider feedback '
          end)
      || lpad(i::text, 4, '0'),
    'Analytics seed: ' || (case (i % 4)
       when 0 then 'Customer reports a problem with a recent booking.'
       when 1 then 'Refund inquiry pending review.'
       when 2 then 'Account or login related question.'
       else 'Feedback about a provider, awaiting follow-up.'
     end),
    case (i % 4)
      when 0 then 'booking_issue'
      when 1 then 'refund'
      when 2 then 'account'
      else 'general'
    end,
    case (i % 10)
      when 0 then 'open'
      when 1 then 'open'
      when 2 then 'open'
      when 3 then 'in_progress'
      when 4 then 'in_progress'
      when 5 then 'resolved'
      when 6 then 'resolved'
      when 7 then 'resolved'
      when 8 then 'closed'
      else 'closed'
    end,
    now() - (((v_days * (120 - i + 1)) / 120) || ' days')::interval,
    case when i % 3 != 0 then v_admin_id else null end
  from generate_series(1, 120) as i;

  select count(*) into v_tickets_count
    from notification_and_support.support_tickets
   where subject like v_tag || '%';

  insert into notification_and_support.support_ticket_replies (
    id, ticket_id, replied_by, message, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':support-reply:' || i || ':' || r),
    uuid_generate_v5(v_ns, v_prefix || ':support-ticket:' || i),
    case when r % 2 = 1 then v_admin_id
         else uuid_generate_v5(v_ns, v_prefix || ':customer-user:' || (((i - 1) % v_total_customers) + 1)) end,
    case r
      when 1 then 'Thanks for reaching out — we''re reviewing the details now.'
      when 2 then 'Just confirming you have the latest update.'
      else 'Closing this ticket. Reach out anytime if it recurs.'
    end,
    now() - (((v_days * (120 - i + 1)) / 120) || ' days')::interval + (r || ' hours')::interval
  from generate_series(1, 120) as i
  cross join generate_series(1, case when i % 2 = 0 then 2 else 1 end) as r
  where i % 2 = 0 or i % 5 = 0;

  select count(*) into v_replies_count
    from notification_and_support.support_ticket_replies str
    join notification_and_support.support_tickets st on st.id = str.ticket_id
   where st.subject like v_tag || '%';

  -------------------------------------------------------------------------
  -- 10. Notifications — 800 mixed events over history.
  -------------------------------------------------------------------------

  insert into notification_and_support.notifications (
    id, user_id, type, title, body, is_read, metadata, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':notification:' || i),
    case when i % 5 = 0
      then uuid_generate_v5(v_ns, v_prefix || ':provider-user:' || (((i - 1) % v_total_providers) + 1))
      else uuid_generate_v5(v_ns, v_prefix || ':customer-user:' || (((i - 1) % v_total_customers) + 1))
    end,
    case (i % 5)
      when 0 then 'admin_provider_message'
      when 1 then 'booking_confirmed'
      when 2 then 'booking_completed'
      when 3 then 'payment_update'
      else 'support_reply'
    end,
    case (i % 5)
      when 0 then 'Message from ServEase admin'
      when 1 then 'Booking confirmed'
      when 2 then 'Booking completed'
      when 3 then 'Payment update'
      else 'Support team replied'
    end,
    case (i % 5)
      when 0 then 'Please review an admin follow-up.'
      when 1 then 'Your booking has been confirmed by the provider.'
      when 2 then 'Your booking is now marked completed.'
      when 3 then 'A payment status has been updated.'
      else 'A support reply is waiting for you.'
    end,
    (i % 3) != 0,
    jsonb_build_object(
      'seedBatchId', v_prefix,
      'index', i
    ),
    now() - (((v_days * (800 - i + 1)) / 800) || ' days')::interval
  from generate_series(1, 800) as i;

  select count(*) into v_notifications_count
    from notification_and_support.notifications
   where metadata ->> 'seedBatchId' = v_prefix;

  -------------------------------------------------------------------------
  -- 11. Provider payouts: 1 default method per provider, monthly payout
  --     aggregation of paid provider_payout amounts, + lifecycle events.
  -------------------------------------------------------------------------

  insert into payment.provider_payout_methods (
    id, provider_id, method_type, account_label, account_name,
    account_number_last4, is_default, created_at, updated_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':payout-method:' || pp.id::text),
    pp.id,
    case (abs(hashtext(pp.id::text)) % 3)
      when 0 then 'bank' when 1 then 'gcash' else 'paymaya'
    end,
    v_tag || ' ' || (case (abs(hashtext(pp.id::text)) % 3)
      when 0 then 'BPI Savings' when 1 then 'GCash Wallet' else 'PayMaya Wallet'
    end),
    pp.business_name,
    lpad((abs(hashtext(pp.id::text)) % 10000)::text, 4, '0'),
    true,
    pp.created_at + interval '1 day',
    now()
  from provider_catalog.provider_profiles pp
  where pp.business_name like v_tag || '%';

  with monthly as (
    select
      p.provider_id,
      date_trunc('month', p.paid_at) as month_start,
      sum(p.provider_payout)::numeric as gross
    from payment.payments p
    join booking.bookings b on b.id = p.booking_id
    where b.booking_reference like v_prefix || '-%'
      and p.status = 'paid'
      and p.paid_at is not null
    group by 1, 2
    having sum(p.provider_payout) > 0
  ),
  enriched as (
    select
      m.*,
      (m.month_start + interval '1 month - 1 day') as period_end,
      extract(epoch from (now() - m.month_start))::bigint / 86400 as age_days,
      round(m.gross * 0.01, 2) as fee,
      pm.id as method_id,
      pm.method_type, pm.account_label
    from monthly m
    join payment.provider_payout_methods pm
      on pm.provider_id = m.provider_id and pm.is_default
    where pm.account_label like v_tag || '%'
  )
  insert into payment.provider_payouts (
    id, provider_id, amount, status, period_start, period_end, paid_at,
    created_at, payout_method_id, method_type, account_label,
    processing_fee, net_amount, reference, requested_by, requested_at, idempotency_key
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':payout:' || provider_id::text || ':' || to_char(month_start, 'YYYY-MM')),
    provider_id,
    gross,
    case
      when age_days > 60 then 'paid'
      when age_days > 30 then case when (abs(hashtext(provider_id::text || to_char(month_start, 'YYYY-MM'))) % 10) < 7 then 'paid' else 'processing' end
      when age_days > 7  then case when (abs(hashtext(provider_id::text || to_char(month_start, 'YYYY-MM'))) % 10) < 5 then 'paid' else 'processing' end
      else 'requested'
    end,
    month_start, period_end,
    case when age_days > 7 then period_end + interval '5 days' else null end,
    period_end + interval '2 days',
    method_id, method_type, account_label,
    fee,
    gross - fee,
    upper(v_prefix) || '-PO-' || to_char(month_start, 'YYYYMM') || '-' || substr(provider_id::text, 1, 8),
    null,
    period_end + interval '1 day',
    v_prefix || ':payout:' || provider_id::text || ':' || to_char(month_start, 'YYYY-MM')
  from enriched;

  insert into payment.provider_payout_events (
    id, payout_id, event_type, status, bank_reference, note, admin_user_id, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':payout-event:' || po.id::text || ':requested'),
    po.id, 'requested', 'requested', null,
    'Provider submitted payout request.', null,
    po.requested_at
  from payment.provider_payouts po
   where po.idempotency_key like v_prefix || ':%';

  insert into payment.provider_payout_events (
    id, payout_id, event_type, status, bank_reference, note, admin_user_id, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':payout-event:' || po.id::text || ':approved'),
    po.id, 'approved', 'processing', null,
    'Approved for processing.', v_admin_id,
    coalesce(po.requested_at, po.created_at) + interval '6 hours'
  from payment.provider_payouts po
   where po.idempotency_key like v_prefix || ':%'
     and po.status in ('processing','paid');

  insert into payment.provider_payout_events (
    id, payout_id, event_type, status, bank_reference, note, admin_user_id, created_at
  )
  select
    uuid_generate_v5(v_ns, v_prefix || ':payout-event:' || po.id::text || ':paid'),
    po.id, 'status_updated', 'paid',
    'BNK-' || substr(po.id::text, 1, 12),
    'Marked paid after bank settlement.', v_admin_id,
    po.paid_at
  from payment.provider_payouts po
   where po.idempotency_key like v_prefix || ':%'
     and po.status = 'paid'
     and po.paid_at is not null;

  -------------------------------------------------------------------------
  -- 12. Build result summary
  -------------------------------------------------------------------------

  v_result := jsonb_build_object(
    'seedBatchId', v_prefix,
    'seeded', true,
    'monthsOfHistory', p_months_of_history,
    'tableCounts', jsonb_build_object(
      'identity_and_user.users', v_users_count,
      'identity_and_user.user_addresses', v_addresses_count,
      'provider_catalog.provider_services', v_provider_services_count,
      'booking.bookings', v_bookings_count,
      'payment.payments', v_payments_count,
      'trust_and_reputation.reviews', v_reviews_count,
      'messages.conversations', v_conversations_count,
      'messages.messages', v_messages_count,
      'notification_and_support.support_tickets', v_tickets_count,
      'notification_and_support.support_ticket_replies', v_replies_count,
      'notification_and_support.notifications', v_notifications_count
    ),
    'totalRows',
      v_users_count + v_addresses_count + v_provider_services_count
      + v_bookings_count + v_payments_count + v_reviews_count
      + v_conversations_count + v_messages_count
      + v_tickets_count + v_replies_count + v_notifications_count
  );
  return v_result;
end;
$$;

revoke all on function public.servease_seed_analytics_production_like_data(text, int, int, int, int) from public, anon, authenticated;
revoke all on function public.servease_cleanup_analytics_production_like_data(text) from public, anon, authenticated;

grant execute on function public.servease_seed_analytics_production_like_data(text, int, int, int, int) to service_role;
grant execute on function public.servease_cleanup_analytics_production_like_data(text) to service_role;
