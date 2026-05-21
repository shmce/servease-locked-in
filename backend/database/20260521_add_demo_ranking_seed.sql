-- Owned by catalog-service demo tooling. Seeds catalog-side ranking data for
-- customer Browse Categories without reading booking-service tables.
create or replace function public.servease_seed_demo_ranking_catalog()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category_cleaning uuid := '11111111-1111-4111-8111-111111111111'::uuid;
  v_category_repairs uuid := '22222222-2222-4222-8222-222222222222'::uuid;
  v_category_specialty uuid := '12121212-1212-4121-8121-121212121212'::uuid;
  v_service_cleaning uuid := '33333333-3333-4333-8333-333333333333'::uuid;
  v_service_repairs uuid := '44444444-4444-4444-8444-444444444444'::uuid;
  v_service_move_out uuid := '13131313-1313-4131-8131-131313131313'::uuid;
  v_service_laundry uuid := '14141414-1414-4141-8141-141414141414'::uuid;
  v_service_assembly uuid := '15151515-1515-4151-8151-151515151515'::uuid;
  v_provider_sparkly uuid := '16161616-1616-4161-8161-161616161616'::uuid;
  v_provider_condocare uuid := '17171717-1717-4171-8171-171717171717'::uuid;
  v_provider_moveout uuid := '18181818-1818-4181-8181-181818181818'::uuid;
  v_provider_precision uuid := '19191919-1919-4191-8191-191919191919'::uuid;
  v_provider_luxe uuid := '20202020-2020-4202-8202-202020202020'::uuid;
  v_user_sparkly uuid := '21212121-2121-4212-8212-212121212121'::uuid;
  v_user_condocare uuid := '23232323-2323-4232-8232-232323232323'::uuid;
  v_user_moveout uuid := '24242424-2424-4242-8242-242424242424'::uuid;
  v_user_precision uuid := '25252525-2525-4252-8252-252525252525'::uuid;
  v_user_luxe uuid := '26262626-2626-4262-8262-262626262626'::uuid;
  v_listing_sparkly uuid := '27272727-2727-4272-8272-272727272727'::uuid;
  v_listing_condocare uuid := '28282828-2828-4282-8282-282828282828'::uuid;
  v_listing_moveout uuid := '29292929-2929-4292-8292-292929292929'::uuid;
  v_listing_precision uuid := '30303030-3030-4303-8303-303030303030'::uuid;
  v_listing_luxe uuid := '31313131-3131-4313-8313-313131313131'::uuid;
begin
  delete from provider_catalog.provider_services
  where id in (
    v_listing_sparkly,
    v_listing_condocare,
    v_listing_moveout,
    v_listing_precision,
    v_listing_luxe
  )
     or provider_id in (
       v_provider_sparkly,
       v_provider_condocare,
       v_provider_moveout,
       v_provider_precision,
       v_provider_luxe
     )
     or service_id in (
       v_service_move_out,
       v_service_laundry,
       v_service_assembly
     );

  delete from provider_catalog.provider_profiles
  where id in (
    v_provider_sparkly,
    v_provider_condocare,
    v_provider_moveout,
    v_provider_precision,
    v_provider_luxe
  )
     or business_name in (
       'Sparkly Squad',
       'CondoCare Crew',
       'Move-Out Masters',
       'Precision Repairs Co.',
       'Luxe Assembly Studio'
     );

  delete from provider_catalog.services
  where id in (v_service_move_out, v_service_laundry, v_service_assembly)
     or name in ('Move-out Cleaning', 'Laundry and Linens', 'Premium Furniture Assembly');

  delete from provider_catalog.service_categories
  where id = v_category_specialty
     or name = 'Specialty Assembly';

  delete from identity_and_user.users
  where id in (
    v_user_sparkly,
    v_user_condocare,
    v_user_moveout,
    v_user_precision,
    v_user_luxe
  );

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
      v_user_sparkly,
      'sparkly.demo@servease.test',
      'managed_by_supabase_auth',
      'Sparkly Squad Demo',
      '+639170004001',
      'provider',
      'active'
    ),
    (
      v_user_condocare,
      'condocare.demo@servease.test',
      'managed_by_supabase_auth',
      'CondoCare Crew Demo',
      '+639170004002',
      'provider',
      'active'
    ),
    (
      v_user_moveout,
      'moveout.demo@servease.test',
      'managed_by_supabase_auth',
      'Move-Out Masters Demo',
      '+639170004003',
      'provider',
      'active'
    ),
    (
      v_user_precision,
      'precision.repairs.demo@servease.test',
      'managed_by_supabase_auth',
      'Precision Repairs Demo',
      '+639170004004',
      'provider',
      'active'
    ),
    (
      v_user_luxe,
      'luxe.assembly.demo@servease.test',
      'managed_by_supabase_auth',
      'Luxe Assembly Demo',
      '+639170004005',
      'provider',
      'active'
    );

  insert into provider_catalog.service_categories (
    id,
    name,
    description,
    icon,
    is_active,
    sort_order
  )
  values (
    v_category_specialty,
    'Specialty Assembly',
    'Premium one-off assembly jobs with limited review history.',
    'hammer',
    true,
    3
  )
  on conflict (id) do update
  set name = excluded.name,
      description = excluded.description,
      icon = excluded.icon,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order;

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
      v_service_move_out,
      v_category_cleaning,
      'Move-out Cleaning',
      'Turnover cleaning for renters and condo owners.',
      2400,
      'flat',
      true
    ),
    (
      v_service_laundry,
      v_category_cleaning,
      'Laundry and Linens',
      'Wash, fold, and linen refresh service.',
      900,
      'flat',
      true
    ),
    (
      v_service_assembly,
      v_category_specialty,
      'Premium Furniture Assembly',
      'Careful assembly for premium furniture and fixtures.',
      1800,
      'flat',
      true
    )
  on conflict (id) do update
  set category_id = excluded.category_id,
      name = excluded.name,
      description = excluded.description,
      price = excluded.price,
      pricing_mode = excluded.pricing_mode,
      is_active = excluded.is_active;

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
  values
    (
      v_provider_sparkly,
      v_user_sparkly,
      'Sparkly Squad',
      'High-volume cleaning crew for weekly and deep-clean jobs.',
      'Residential cleaning and refresh visits.',
      4,
      'Mandaluyong, Pasig, Makati',
      array['English', 'Filipino'],
      array['Popular', 'Multi-person crew'],
      10,
      'approved',
      4.4,
      18,
      true
    ),
    (
      v_provider_condocare,
      v_user_condocare,
      'CondoCare Crew',
      'Condo-focused cleaning team with steady customer demand.',
      'Condo cleaning, linen reset, and upkeep.',
      6,
      'BGC, Makati, Mandaluyong',
      array['English', 'Filipino'],
      array['Popular', 'Condo specialist'],
      10,
      'approved',
      4.6,
      34,
      true
    ),
    (
      v_provider_moveout,
      v_user_moveout,
      'Move-Out Masters',
      'Turnover cleaning team for move-out and handover jobs.',
      'Move-out cleaning and turnover preparation.',
      7,
      'Metro Manila',
      array['English', 'Filipino'],
      array['Popular', 'Turnover jobs'],
      15,
      'approved',
      4.5,
      25,
      true
    ),
    (
      v_provider_precision,
      v_user_precision,
      'Precision Repairs Co.',
      'Highly rated repair team with a deeper review history.',
      'Fixtures, small repairs, and maintenance visits.',
      9,
      'Makati, Pasig, Taguig',
      array['English', 'Filipino'],
      array['Top rated', 'Senior technicians'],
      12,
      'approved',
      4.96,
      80,
      true
    ),
    (
      v_provider_luxe,
      v_user_luxe,
      'Luxe Assembly Studio',
      'Premium assembly provider with an intentionally tiny sample size.',
      'Premium furniture and fixture assembly.',
      3,
      'Makati, BGC',
      array['English', 'Filipino'],
      array['New', 'Premium'],
      8,
      'approved',
      5.0,
      1,
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
      v_listing_sparkly,
      v_provider_sparkly,
      v_service_cleaning,
      'Sparkly Deep Clean',
      'Busy cleaning team with strong catalog volume.',
      1450,
      'flat',
      null,
      1450,
      true
    ),
    (
      v_listing_condocare,
      v_provider_condocare,
      v_service_laundry,
      'CondoCare Laundry Reset',
      'Laundry and linen reset for condos.',
      900,
      'flat',
      null,
      900,
      true
    ),
    (
      v_listing_moveout,
      v_provider_moveout,
      v_service_move_out,
      'Move-Out Cleaning Package',
      'Turnover-ready cleaning for move-out schedules.',
      2400,
      'flat',
      null,
      2400,
      true
    ),
    (
      v_listing_precision,
      v_provider_precision,
      v_service_repairs,
      'Precision Minor Repair Visit',
      'Top-rated small repair visit with a deeper review base.',
      850,
      'hourly',
      850,
      null,
      true
    ),
    (
      v_listing_luxe,
      v_provider_luxe,
      v_service_assembly,
      'Luxe Assembly Session',
      'One-review 5.0 example that should not outrank trusted categories.',
      1800,
      'flat',
      null,
      1800,
      true
    );

  return jsonb_build_object(
    'popularCategoryId', v_category_cleaning,
    'topRatedCategoryId', v_category_repairs,
    'singleReviewCategoryId', v_category_specialty,
    'seededProviderIds', jsonb_build_array(
      v_provider_sparkly,
      v_provider_condocare,
      v_provider_moveout,
      v_provider_precision,
      v_provider_luxe
    )
  );
end;
$$;

revoke all on function public.servease_seed_demo_ranking_catalog() from public, anon, authenticated;
grant execute on function public.servease_seed_demo_ranking_catalog() to service_role;
