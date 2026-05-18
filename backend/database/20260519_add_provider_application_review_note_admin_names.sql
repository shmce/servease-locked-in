-- Purpose: Include admin display names in provider application review notes.

create or replace function public.servease_admin_get_provider_application_review(
  p_provider_id uuid
)
returns table (
  application_id uuid,
  kyc_checklist jsonb,
  business_checklist jsonb,
  verification_records jsonb,
  ocr_data jsonb,
  notes jsonb,
  is_complete boolean,
  updated_by uuid,
  updated_at timestamptz
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select
    pp.id as application_id,
    coalesce(r.kyc_checklist, public.servease_default_provider_application_kyc_checklist()) as kyc_checklist,
    coalesce(r.business_checklist, public.servease_default_provider_application_business_checklist()) as business_checklist,
    coalesce(r.verification_records, public.servease_default_provider_application_verification_records()) as verification_records,
    coalesce(r.ocr_data, '{}'::jsonb) as ocr_data,
    coalesce(notes.items, '[]'::jsonb) as notes,
    public.servease_provider_application_review_complete(
      coalesce(r.kyc_checklist, public.servease_default_provider_application_kyc_checklist()),
      coalesce(r.business_checklist, public.servease_default_provider_application_business_checklist())
    ) as is_complete,
    r.updated_by,
    r.updated_at
  from provider_catalog.provider_profiles pp
  left join provider_catalog.provider_application_reviews r
    on r.provider_id = pp.id
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', n.id,
        'adminUserId', n.admin_user_id,
        'adminName', coalesce(nullif(u.full_name, ''), u.email, n.admin_user_id::text),
        'note', n.note,
        'createdAt', n.created_at
      )
      order by n.created_at desc
    ) as items
    from provider_catalog.provider_application_review_notes n
    left join identity_and_user.users u on u.id = n.admin_user_id
    where n.provider_id = pp.id
  ) notes on true
  where pp.id = p_provider_id
  limit 1;
$$;

revoke all on function public.servease_admin_get_provider_application_review(uuid)
  from public, anon, authenticated;
grant execute on function public.servease_admin_get_provider_application_review(uuid)
  to service_role;
