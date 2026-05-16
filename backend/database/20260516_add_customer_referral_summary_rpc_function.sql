create table if not exists identity_and_user.referral_events (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references identity_and_user.users(id) on delete cascade,
  referred_user_id uuid references identity_and_user.users(id) on delete set null,
  referral_code text not null,
  status text not null default 'pending',
  reward_amount numeric not null default 0,
  created_at timestamptz default now(),
  completed_at timestamptz,
  constraint referral_events_status_check
    check (status in ('pending', 'completed', 'cancelled'))
);

alter table identity_and_user.referral_events enable row level security;

drop policy if exists referral_events_service_role_all
  on identity_and_user.referral_events;

create policy referral_events_service_role_all
  on identity_and_user.referral_events
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists referral_events_referrer_created_idx
  on identity_and_user.referral_events (referrer_user_id, created_at desc);

create index if not exists referral_events_code_idx
  on identity_and_user.referral_events (referral_code);

create or replace function public.servease_referral_code(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = identity_and_user, public
as $$
  select 'SE-' || upper(substr(replace(p_user_id::text, '-', ''), 1, 8));
$$;

create or replace function public.servease_get_referral_summary(p_user_id uuid)
returns table (
  referral_code text,
  referral_link_path text,
  completed_referrals integer,
  pending_referrals integer,
  total_rewards numeric
)
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
declare
  v_code text;
begin
  if not exists (
    select 1
    from identity_and_user.users u
    where u.id = p_user_id
  ) then
    raise exception 'user_not_found';
  end if;

  v_code := public.servease_referral_code(p_user_id);

  return query
  select
    v_code,
    '/signup?ref=' || v_code,
    count(*) filter (where e.status = 'completed')::integer,
    count(*) filter (where e.status = 'pending')::integer,
    coalesce(sum(e.reward_amount) filter (where e.status = 'completed'), 0)
  from identity_and_user.referral_events e
  where e.referrer_user_id = p_user_id;
end;
$$;

revoke all on function public.servease_referral_code(uuid) from public, anon, authenticated;
revoke all on function public.servease_get_referral_summary(uuid) from public, anon, authenticated;

grant execute on function public.servease_referral_code(uuid) to service_role;
grant execute on function public.servease_get_referral_summary(uuid) to service_role;
