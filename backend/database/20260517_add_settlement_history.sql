create table if not exists payment.provider_payout_events (
  id uuid primary key default gen_random_uuid(),
  payout_id uuid not null references payment.provider_payouts(id) on delete cascade,
  event_type text not null check (event_type in (
    'requested',
    'approved',
    'rejected',
    'status_updated',
    'bank_reference_reconciled'
  )),
  status text not null check (status in ('requested', 'processing', 'paid', 'cancelled')),
  bank_reference text,
  note text,
  admin_user_id uuid,
  created_at timestamptz not null default now()
);

alter table payment.provider_payout_events enable row level security;

drop policy if exists provider_payout_events_service_role_all on payment.provider_payout_events;
create policy provider_payout_events_service_role_all
  on payment.provider_payout_events
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists provider_payout_events_payout_created_idx
  on payment.provider_payout_events (payout_id, created_at desc);

create or replace function public.servease_admin_list_provider_payout_events(
  p_payout_id uuid
)
returns table (
  id uuid,
  payout_id uuid,
  event_type text,
  status text,
  bank_reference text,
  note text,
  admin_user_id uuid,
  created_at timestamptz
)
language sql
security definer
set search_path = payment, public
as $$
  select
    e.id,
    e.payout_id,
    e.event_type,
    e.status,
    e.bank_reference,
    e.note,
    e.admin_user_id,
    e.created_at
  from payment.provider_payout_events e
  where e.payout_id = p_payout_id
  order by e.created_at desc;
$$;

create or replace function public.servease_admin_record_provider_payout_event(
  p_payout_id uuid,
  p_event_type text,
  p_status text,
  p_bank_reference text,
  p_note text,
  p_admin_user_id uuid
)
returns table (
  id uuid,
  payout_id uuid,
  event_type text,
  status text,
  bank_reference text,
  note text,
  admin_user_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_id uuid := gen_random_uuid();
begin
  if p_payout_id is null
    or p_event_type not in (
      'requested',
      'approved',
      'rejected',
      'status_updated',
      'bank_reference_reconciled'
    )
    or p_status not in ('requested', 'processing', 'paid', 'cancelled')
    or not exists (
      select 1
      from payment.provider_payouts p
      where p.id = p_payout_id
    ) then
    raise exception 'invalid_payment_request';
  end if;

  insert into payment.provider_payout_events (
    id,
    payout_id,
    event_type,
    status,
    bank_reference,
    note,
    admin_user_id
  )
  values (
    v_id,
    p_payout_id,
    p_event_type,
    p_status,
    nullif(btrim(coalesce(p_bank_reference, '')), ''),
    nullif(btrim(coalesce(p_note, '')), ''),
    p_admin_user_id
  );

  return query
  select
    e.id,
    e.payout_id,
    e.event_type,
    e.status,
    e.bank_reference,
    e.note,
    e.admin_user_id,
    e.created_at
  from payment.provider_payout_events e
  where e.id = v_id;
end;
$$;

revoke all on function public.servease_admin_list_provider_payout_events(uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_record_provider_payout_event(uuid, text, text, text, text, uuid) from public, anon, authenticated;

grant execute on function public.servease_admin_list_provider_payout_events(uuid) to service_role;
grant execute on function public.servease_admin_record_provider_payout_event(uuid, text, text, text, text, uuid) to service_role;
