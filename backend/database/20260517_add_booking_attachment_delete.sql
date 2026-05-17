-- Soft-delete a booking attachment as the original uploader, the booking
-- customer, or the booking provider owner. Used by mobile/provider-web for the
-- attachment-lifecycle gap identified in the 2026-05-17 audit while preserving
-- evidence for admin review.

alter table booking.booking_attachments
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid;

create index if not exists booking_attachments_booking_visible_idx
  on booking.booking_attachments (booking_id, created_at desc)
  where deleted_at is null;

create or replace function public.servease_delete_booking_attachment(
  p_booking_id uuid,
  p_attachment_id uuid,
  p_actor_id uuid
)
returns table (
  id uuid,
  booking_id uuid,
  uploaded_by uuid,
  media_kind text,
  file_url text,
  file_name text,
  mime_type text,
  storage_path text,
  file_size bigint,
  caption text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = booking, public
as $$
declare
  v_uploaded_by uuid;
  v_customer_id uuid;
  v_provider_owner uuid;
begin
  if p_booking_id is null or p_attachment_id is null or p_actor_id is null then
    raise exception 'invalid_attachment_request';
  end if;

  select a.uploaded_by into v_uploaded_by
  from booking.booking_attachments a
  where a.id = p_attachment_id
    and a.booking_id = p_booking_id
    and a.deleted_at is null;

  if v_uploaded_by is null then
    raise exception 'attachment_not_found';
  end if;

  select b.customer_id into v_customer_id
  from booking.bookings b
  where b.id = p_booking_id;

  select p.user_id into v_provider_owner
  from booking.bookings b
  join provider_catalog.providers p on p.id = b.provider_id
  where b.id = p_booking_id;

  if v_uploaded_by <> p_actor_id
     and (v_customer_id is null or v_customer_id <> p_actor_id)
     and (v_provider_owner is null or v_provider_owner <> p_actor_id) then
    raise exception 'attachment_forbidden';
  end if;

  return query
    update booking.booking_attachments a
    set deleted_at = now(),
        deleted_by = p_actor_id
    where a.id = p_attachment_id
      and a.deleted_at is null
    returning
      a.id, a.booking_id, a.uploaded_by, a.media_kind,
      a.file_url, a.file_name, a.mime_type, a.storage_path, a.file_size,
      a.caption, a.created_at;
end;
$$;

drop function if exists public.servease_list_visible_bookings(uuid, uuid);
create function public.servease_list_visible_bookings(
  p_customer_id uuid default null,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  booking_reference text,
  customer_id uuid,
  provider_id uuid,
  service_id uuid,
  service_title text,
  service_address text,
  scheduled_at timestamptz,
  status text,
  total_amount numeric,
  attachments jsonb
)
language sql
security definer
set search_path = booking, public
as $$
  select
    b.id,
    b.booking_reference,
    b.customer_id,
    b.provider_id,
    b.service_id,
    b.service_title,
    b.service_address,
    b.scheduled_at,
    b.status,
    b.total_amount,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'bookingId', a.booking_id,
            'uploadedBy', a.uploaded_by,
            'mediaKind', a.media_kind,
            'fileUrl', a.file_url,
            'fileName', a.file_name,
            'mimeType', a.mime_type,
            'storagePath', a.storage_path,
            'fileSize', a.file_size,
            'caption', a.caption,
            'createdAt', a.created_at
          )
          order by a.created_at desc nulls last
        )
        from booking.booking_attachments a
        where a.booking_id = b.id
          and a.deleted_at is null
      ),
      '[]'::jsonb
    ) as attachments
  from booking.bookings b
  where (p_customer_id is not null and b.customer_id = p_customer_id)
     or (p_provider_id is not null and b.provider_id = p_provider_id)
  order by b.created_at desc nulls last, b.scheduled_at desc
  limit 50;
$$;

drop function if exists public.servease_get_visible_booking(uuid, uuid, uuid);
create function public.servease_get_visible_booking(
  p_booking_id uuid,
  p_customer_id uuid default null,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  booking_reference text,
  customer_id uuid,
  provider_id uuid,
  service_id uuid,
  service_title text,
  service_address text,
  scheduled_at timestamptz,
  status text,
  total_amount numeric,
  attachments jsonb
)
language sql
security definer
set search_path = booking, public
as $$
  select
    b.id,
    b.booking_reference,
    b.customer_id,
    b.provider_id,
    b.service_id,
    b.service_title,
    b.service_address,
    b.scheduled_at,
    b.status,
    b.total_amount,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'bookingId', a.booking_id,
            'uploadedBy', a.uploaded_by,
            'mediaKind', a.media_kind,
            'fileUrl', a.file_url,
            'fileName', a.file_name,
            'mimeType', a.mime_type,
            'storagePath', a.storage_path,
            'fileSize', a.file_size,
            'caption', a.caption,
            'createdAt', a.created_at
          )
          order by a.created_at desc nulls last
        )
        from booking.booking_attachments a
        where a.booking_id = b.id
          and a.deleted_at is null
      ),
      '[]'::jsonb
    ) as attachments
  from booking.bookings b
  where b.id = p_booking_id
    and (
      (p_customer_id is not null and b.customer_id = p_customer_id)
      or (p_provider_id is not null and b.provider_id = p_provider_id)
    )
  limit 1;
$$;

revoke all on function public.servease_delete_booking_attachment(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_list_visible_bookings(uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_get_visible_booking(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.servease_delete_booking_attachment(uuid, uuid, uuid) to service_role;
grant execute on function public.servease_list_visible_bookings(uuid, uuid) to service_role;
grant execute on function public.servease_get_visible_booking(uuid, uuid, uuid) to service_role;
