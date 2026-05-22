-- Owner: Catalog Service
-- Purpose: Replace temporary/demo catalog category labels with the agreed
-- ServEase top-level categories while preserving existing service rows.

do $$
declare
  v_home uuid := '22222222-2222-4222-8222-222222222222'::uuid;
  v_domestic uuid := '11111111-1111-4111-8111-111111111111'::uuid;
  v_beauty uuid := public.uuid_generate_v5(public.uuid_ns_url(), 'servease:category:beauty-wellness-personal-care');
  v_education uuid := public.uuid_generate_v5(public.uuid_ns_url(), 'servease:category:educational-professional-services');
  v_pet uuid := public.uuid_generate_v5(public.uuid_ns_url(), 'servease:category:pet-services');
  v_events uuid := public.uuid_generate_v5(public.uuid_ns_url(), 'servease:category:events-entertainment');
  v_auto uuid := public.uuid_generate_v5(public.uuid_ns_url(), 'servease:category:automotive-tech-support');
begin
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
      v_home,
      'Home Maintenance & Repair',
      'Repairs, maintenance, installations, and household fixes.',
      'wrench',
      true,
      1
    ),
    (
      v_beauty,
      'Beauty, Wellness & Personal Care',
      'Hair, makeup, massage, nails, skincare, and personal wellness services.',
      'sparkles',
      true,
      2
    ),
    (
      v_education,
      'Educational & Professional Services',
      'Tutoring, coaching, lessons, consulting, and professional support.',
      'graduation-cap',
      true,
      3
    ),
    (
      v_domestic,
      'Domestic & Cleaning Services',
      'Home cleaning, laundry, housekeeping, and domestic help.',
      'home',
      true,
      4
    ),
    (
      v_pet,
      'Pet Services',
      'Pet grooming, walking, sitting, training, and care.',
      'paw-print',
      true,
      5
    ),
    (
      v_events,
      'Events & Entertainment',
      'Photography, hosting, catering, music, decor, and event support.',
      'party-popper',
      true,
      6
    ),
    (
      v_auto,
      'Automotive & Tech Support',
      'Vehicle care, device repair, setup, troubleshooting, and tech support.',
      'monitor-smartphone',
      true,
      7
    )
  on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    icon = excluded.icon,
    is_active = true,
    sort_order = excluded.sort_order;

  update provider_catalog.services
  set category_id = case
    when name ilike '%clean%' or name ilike '%laundry%' or name ilike '%linen%' then v_domestic
    when name ilike '%hair%' or name ilike '%makeup%' or name ilike '%wellness%' or name ilike '%beauty%' then v_beauty
    when name ilike '%math%' or name ilike '%tutor%' or name ilike '%lesson%' then v_education
    when name ilike '%pet%' or name ilike '%dog%' or name ilike '%cat%' then v_pet
    when name ilike '%event%' or name ilike '%photo%' or name ilike '%cater%' or name ilike '%music%' then v_events
    when name ilike '%auto%' or name ilike '%car%' or name ilike '%tech%' or name ilike '%gadget%' or name ilike '%it %' then v_auto
    else v_home
  end
  where category_id is not null;

  update provider_catalog.service_categories
  set is_active = false
  where id not in (v_home, v_beauty, v_education, v_domestic, v_pet, v_events, v_auto);

  update payment.commission_rules
  set id = 'educational-professional-services',
      category_key = 'educational-professional-services',
      category_label = 'Educational & Professional Services'
  where id = 'education-professional-services'
    and not exists (
      select 1
      from payment.commission_rules
      where id = 'educational-professional-services'
    );

  delete from payment.commission_rules
  where id in ('education-professional-services', 'health-fitness');

  insert into payment.commission_rules (
    id,
    category_key,
    category_label,
    current_rate,
    previous_rate,
    monthly_revenue,
    monthly_commission
  )
  values
    ('home-maintenance-repair', 'home-maintenance-repair', 'Home Maintenance & Repair', 12, 10, 1250000, 150000),
    ('beauty-wellness-personal-care', 'beauty-wellness-personal-care', 'Beauty, Wellness & Personal Care', 15, 15, 850000, 127500),
    ('domestic-cleaning-services', 'domestic-cleaning-services', 'Domestic & Cleaning Services', 10, 8, 980000, 98000),
    ('pet-services', 'pet-services', 'Pet Services', 18, 18, 450000, 81000),
    ('events-entertainment', 'events-entertainment', 'Events & Entertainment', 20, 18, 2100000, 420000),
    ('automotive-tech-support', 'automotive-tech-support', 'Automotive & Tech Support', 14, 14, 670000, 93800),
    ('educational-professional-services', 'educational-professional-services', 'Educational & Professional Services', 16, 15, 540000, 86400)
  on conflict (id) do update set
    category_key = excluded.category_key,
    category_label = excluded.category_label;
end $$;
