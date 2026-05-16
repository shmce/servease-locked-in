create or replace function public.servease_seed_demo_data(
  p_customer_id uuid,
  p_provider_user_id uuid,
  p_admin_id uuid,
  p_customer_email text,
  p_provider_email text,
  p_admin_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category_cleaning uuid := '11111111-1111-4111-8111-111111111111'::uuid;
  v_category_repairs uuid := '22222222-2222-4222-8222-222222222222'::uuid;
  v_service_cleaning uuid := '33333333-3333-4333-8333-333333333333'::uuid;
  v_service_repairs uuid := '44444444-4444-4444-8444-444444444444'::uuid;
  v_provider_profile uuid := '55555555-5555-4555-8555-555555555555'::uuid;
  v_listing_cleaning uuid := '66666666-6666-4666-8666-666666666666'::uuid;
  v_listing_repairs uuid := '77777777-7777-4777-8777-777777777777'::uuid;
  v_booking uuid := '88888888-8888-4888-8888-888888888888'::uuid;
  v_conversation uuid := '99999999-9999-4999-8999-999999999999'::uuid;
  v_message uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid;
  v_payment uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid;
  v_refund uuid := 'abababab-abab-4aba-8aba-abababababab'::uuid;
  v_support_ticket uuid := 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid;
  v_notification uuid := 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid;
  v_dispute uuid := 'ffffffff-ffff-4fff-8fff-ffffffffffff'::uuid;
  v_scheduled_at timestamptz := date_trunc('day', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila' + interval '2 days 10 hours';
begin
  delete from provider_catalog.provider_services
  where provider_id in (
    select id
    from provider_catalog.provider_profiles
    where user_id = p_provider_user_id
       or business_name = 'GreenFix Home Services'
  )
     or service_id in (
       select id
       from provider_catalog.services
       where name in ('Deep Home Cleaning', 'Minor Home Repairs')
     );

  delete from provider_catalog.provider_profiles
  where user_id = p_provider_user_id
     or business_name = 'GreenFix Home Services';

  delete from provider_catalog.services
  where name in ('Deep Home Cleaning', 'Minor Home Repairs');

  delete from provider_catalog.service_categories
  where name in ('Home Cleaning', 'Repairs');

  delete from messages.messages where conversation_id = v_conversation;
  delete from messages.conversations where id = v_conversation;
  delete from payment.payments where booking_id = v_booking;
  delete from trust_and_reputation.reviews where booking_id = v_booking;
  delete from notification_and_support.support_tickets where id = v_support_ticket;
  delete from notification_and_support.notifications where id = v_notification;
  delete from booking.booking_service_updates where booking_id = v_booking;
  delete from booking.booking_attachments where booking_id = v_booking;
  delete from booking.booking_timeline_events where booking_id = v_booking;
  delete from booking.disputes where booking_id = v_booking or id = v_dispute;
  delete from booking.bookings where id = v_booking;
  delete from booking.provider_days_off where user_id = v_provider_profile;
  delete from booking.provider_availability_windows where user_id = v_provider_profile;
  delete from provider_catalog.provider_services where provider_id = v_provider_profile;
  delete from provider_catalog.provider_profiles where id = v_provider_profile;
  delete from provider_catalog.services where id in (v_service_cleaning, v_service_repairs);
  delete from provider_catalog.service_categories where id in (v_category_cleaning, v_category_repairs);
  delete from identity_and_user.customer_profiles where user_id = p_customer_id;
  delete from identity_and_user.users where id in (p_customer_id, p_provider_user_id, p_admin_id);

  insert into identity_and_user.users (
    id,
    email,
    password_hash,
    full_name,
    contact_number,
    role,
    status
  )
  values
    (
      p_customer_id,
      lower(trim(p_customer_email)),
      'managed_by_supabase_auth',
      'Casey Demo Customer',
      '+639170001001',
      'customer',
      'active'
    ),
    (
      p_provider_user_id,
      lower(trim(p_provider_email)),
      'managed_by_supabase_auth',
      'Priya Demo Provider',
      '+639170002002',
      'provider',
      'active'
    ),
    (
      p_admin_id,
      lower(trim(p_admin_email)),
      'managed_by_supabase_auth',
      'Admin Demo User',
      '+639170003003',
      'admin',
      'active'
    );

  insert into identity_and_user.customer_profiles (
    user_id,
    address
  )
  values (
    p_customer_id,
    'Unit 12B Greenfield Residences, Mandaluyong City'
  );

  insert into provider_catalog.service_categories (
    id,
    name,
    description,
    icon,
    is_active,
    sort_order
  )
  values
    (
      v_category_cleaning,
      'Home Cleaning',
      'Cleaning and upkeep for homes, condos, and apartments.',
      'sparkles',
      true,
      1
    ),
    (
      v_category_repairs,
      'Repairs',
      'General home repairs and maintenance visits.',
      'wrench',
      true,
      2
    );

  insert into provider_catalog.services (
    id,
    category_id,
    name,
    description,
    price,
    pricing_mode,
    is_active
  )
  values
    (
      v_service_cleaning,
      v_category_cleaning,
      'Deep Home Cleaning',
      'Whole-home cleaning with kitchen, bath, and common-area coverage.',
      1500,
      'flat',
      true
    ),
    (
      v_service_repairs,
      v_category_repairs,
      'Minor Home Repairs',
      'Small repairs, fixtures, and maintenance tasks.',
      650,
      'hourly',
      true
    );

  insert into provider_catalog.provider_profiles (
    id,
    user_id,
    business_name,
    bio,
    service_description,
    years_experience,
    service_area,
    languages,
    tags,
    service_radius_km,
    verification_status,
    average_rating,
    review_count,
    is_active
  )
  values (
    v_provider_profile,
    p_provider_user_id,
    'GreenFix Home Services',
    'Reliable home service team for cleaning and repairs.',
    'Professional cleaning, repairs, and maintenance.',
    5,
    'Mandaluyong, Pasig, Makati',
    array['English', 'Filipino'],
    array['Verified', 'Insured', 'Same-week availability'],
    12,
    'approved',
    4.9,
    28,
    true
  );

  insert into provider_catalog.provider_services (
    id,
    provider_id,
    service_id,
    title,
    description,
    price,
    pricing_mode,
    hourly_rate,
    flat_rate,
    is_active
  )
  values
    (
      v_listing_cleaning,
      v_provider_profile,
      v_service_cleaning,
      'Deep Home Cleaning Package',
      'A complete cleaning visit for apartments and family homes.',
      1500,
      'flat',
      null,
      1500,
      true
    ),
    (
      v_listing_repairs,
      v_provider_profile,
      v_service_repairs,
      'Minor Repair Visit',
      'Hourly help for fixtures, small repairs, and maintenance.',
      650,
      'hourly',
      650,
      null,
      true
    );

  insert into booking.provider_availability_windows (
    user_id,
    day_of_week,
    start_time,
    end_time,
    is_active,
    sort_order
  )
  values
    (v_provider_profile, 'monday', '09:00'::time, '17:00'::time, true, 1),
    (v_provider_profile, 'tuesday', '09:00'::time, '17:00'::time, true, 2),
    (v_provider_profile, 'wednesday', '09:00'::time, '17:00'::time, true, 3),
    (v_provider_profile, 'thursday', '09:00'::time, '17:00'::time, true, 4),
    (v_provider_profile, 'friday', '09:00'::time, '17:00'::time, true, 5),
    (v_provider_profile, 'saturday', '09:00'::time, '17:00'::time, true, 6);

  insert into booking.bookings (
    id,
    booking_reference,
    customer_id,
    provider_id,
    service_id,
    service_title,
    service_name,
    service_description,
    service_address,
    scheduled_at,
    hours_required,
    service_amount,
    additional_amount,
    total_amount,
    pricing_mode,
    flat_rate,
    payment_method,
    customer_notes,
    status
  )
  values (
    v_booking,
    'SE-DEMO-001',
    p_customer_id,
    v_provider_profile,
    v_service_cleaning,
    'Deep Home Cleaning Package',
    'Deep Home Cleaning',
    'Demo cleaning appointment for mobile testing.',
    'Unit 12B Greenfield Residences, Mandaluyong City',
    v_scheduled_at,
    2,
    1500,
    0,
    1500,
    'flat',
    1500,
    'cash_on_service',
    'Demo seed booking',
    'confirmed'
  );

  insert into booking.booking_timeline_events (
    booking_id,
    event_type,
    label,
    icon
  )
  values
    (v_booking, 'created', 'Booking requested', 'calendar'),
    (v_booking, 'status_changed', 'Booking status changed to confirmed', 'activity');

  insert into booking.booking_service_updates (
    booking_id,
    actor_id,
    update_type,
    message
  )
  values (
    v_booking,
    p_provider_user_id,
    'progress',
    'Demo provider is preparing tools for the appointment.'
  );

  insert into messages.conversations (
    id,
    booking_id,
    customer_id,
    provider_id,
    last_message_at
  )
  values (
    v_conversation,
    v_booking,
    p_customer_id,
    v_provider_profile,
    now()
  );

  insert into messages.messages (
    id,
    conversation_id,
    sender_id,
    sender_role,
    content,
    delivery_status
  )
  values (
    v_message,
    v_conversation,
    p_customer_id,
    'customer',
    'Hi, please bring eco-friendly cleaning supplies.',
    'sent'
  );

  insert into payment.payments (
    id,
    booking_id,
    customer_id,
    provider_id,
    amount,
    platform_fee,
    provider_payout,
    status,
    payment_method
  )
  values (
    v_payment,
    v_booking,
    p_customer_id,
    v_provider_profile,
    1500,
    225,
    1275,
    'pending',
    'cash_on_service'
  );

  insert into payment.refund_requests (
    id,
    payment_id,
    booking_id,
    customer_id,
    provider_id,
    amount,
    reason,
    status
  )
  values (
    v_refund,
    v_payment,
    v_booking,
    p_customer_id,
    v_provider_profile,
    1500,
    'Customer requested refund review for the demo booking.',
    'requested'
  )
  on conflict (payment_id) do update
  set status = 'requested',
      reason = excluded.reason,
      decided_by = null,
      decision_reason = null,
      decided_at = null,
      processed_at = null;

  insert into notification_and_support.support_tickets (
    id,
    user_id,
    subject,
    message,
    category,
    status
  )
  values (
    v_support_ticket,
    p_customer_id,
    'Demo support ticket',
    'This ticket is seeded for admin support testing.',
    'booking',
    'open'
  );

  insert into booking.disputes (
    id,
    booking_id,
    raised_by,
    reason,
    status
  )
  values (
    v_dispute,
    v_booking,
    p_customer_id,
    'Demo dispute for admin resolution testing.',
    'open'
  );

  insert into notification_and_support.notifications (
    id,
    user_id,
    type,
    title,
    body,
    is_read,
    metadata
  )
  values (
    v_notification,
    p_customer_id,
    'booking_update',
    'Demo booking confirmed',
    'GreenFix Home Services confirmed your demo booking.',
    false,
    jsonb_build_object('bookingId', v_booking)
  );

  return jsonb_build_object(
    'customerUserId', p_customer_id,
    'providerUserId', p_provider_user_id,
    'adminUserId', p_admin_id,
    'providerId', v_provider_profile,
    'bookingId', v_booking,
    'serviceId', v_service_cleaning,
    'paymentId', v_payment,
    'disputeId', v_dispute,
    'supportTicketId', v_support_ticket
  );
end;
$$;

revoke all on function public.servease_seed_demo_data(uuid, uuid, uuid, text, text, text) from public, anon, authenticated;

grant execute on function public.servease_seed_demo_data(uuid, uuid, uuid, text, text, text) to service_role;
