create or replace function public.servease_create_payment(
  p_booking_id uuid,
  p_customer_id uuid,
  p_provider_id uuid,
  p_amount numeric,
  p_payment_method text
)
returns table (
  id uuid,
  booking_id uuid,
  customer_id uuid,
  provider_id uuid,
  amount numeric,
  platform_fee numeric,
  provider_payout numeric,
  status text,
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_commission_rate numeric;
  v_platform_fee numeric;
  v_provider_payout numeric;
  v_payment_id uuid;
begin
  if p_booking_id is null
    or p_customer_id is null
    or p_provider_id is null
    or p_amount is null
    or p_amount <= 0
    or nullif(trim(p_payment_method), '') is null then
    raise exception 'invalid_payment_request';
  end if;

  select coalesce(pc.commission_rate, 15.00)
    into v_commission_rate
  from payment.platform_pricing_config pc
  order by pc.updated_at desc nulls last
  limit 1;

  v_commission_rate := coalesce(v_commission_rate, 15.00);
  v_platform_fee := round((p_amount * v_commission_rate) / 100, 2);
  v_provider_payout := p_amount - v_platform_fee;

  update payment.payments p
  set
    customer_id = p_customer_id,
    provider_id = p_provider_id,
    amount = p_amount,
    platform_fee = v_platform_fee,
    provider_payout = v_provider_payout,
    payment_method = trim(p_payment_method)
  where p.booking_id = p_booking_id
  returning p.id into v_payment_id;

  if v_payment_id is null then
    begin
      insert into payment.payments (
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
        p_booking_id,
        p_customer_id,
        p_provider_id,
        p_amount,
        v_platform_fee,
        v_provider_payout,
        'pending',
        trim(p_payment_method)
      )
      returning payment.payments.id into v_payment_id;
    exception
      when unique_violation then
        update payment.payments p
        set
          customer_id = p_customer_id,
          provider_id = p_provider_id,
          amount = p_amount,
          platform_fee = v_platform_fee,
          provider_payout = v_provider_payout,
          payment_method = trim(p_payment_method)
        where p.booking_id = p_booking_id
        returning p.id into v_payment_id;
    end;
  end if;

  return query
    select
      p.id,
      p.booking_id,
      p.customer_id,
      p.provider_id,
      p.amount,
      p.platform_fee,
      p.provider_payout,
      p.status,
      p.payment_method,
      p.paid_at,
      p.created_at
    from payment.payments p
    where p.id = v_payment_id
    limit 1;
end;
$$;

create or replace function public.servease_create_review(
  p_booking_id uuid,
  p_provider_id uuid,
  p_reviewer_id uuid,
  p_rating integer,
  p_review_text text default null
)
returns table (
  id uuid,
  booking_id uuid,
  provider_id uuid,
  reviewer_id uuid,
  rating integer,
  review_text text,
  is_flagged boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = trust_and_reputation, public
as $$
declare
  v_review_id uuid;
begin
  if p_booking_id is null
    or p_provider_id is null
    or p_reviewer_id is null
    or p_rating is null
    or p_rating < 1
    or p_rating > 5 then
    raise exception 'invalid_review_request';
  end if;

  update trust_and_reputation.reviews r
  set
    provider_id = p_provider_id,
    rating = p_rating,
    review_text = nullif(trim(coalesce(p_review_text, '')), ''),
    is_flagged = false
  where r.booking_id = p_booking_id
    and r.reviewer_id = p_reviewer_id
  returning r.id into v_review_id;

  if v_review_id is null then
    begin
      insert into trust_and_reputation.reviews (
        booking_id,
        provider_id,
        reviewer_id,
        rating,
        review_text,
        is_flagged
      )
      values (
        p_booking_id,
        p_provider_id,
        p_reviewer_id,
        p_rating,
        nullif(trim(coalesce(p_review_text, '')), ''),
        false
      )
      returning trust_and_reputation.reviews.id into v_review_id;
    exception
      when unique_violation then
        update trust_and_reputation.reviews r
        set
          provider_id = p_provider_id,
          rating = p_rating,
          review_text = nullif(trim(coalesce(p_review_text, '')), ''),
          is_flagged = false
        where r.booking_id = p_booking_id
          and r.reviewer_id = p_reviewer_id
        returning r.id into v_review_id;
    end;
  end if;

  return query
    select
      r.id,
      r.booking_id,
      r.provider_id,
      r.reviewer_id,
      r.rating,
      r.review_text,
      r.is_flagged,
      r.created_at
    from trust_and_reputation.reviews r
    where r.id = v_review_id
    limit 1;
end;
$$;

revoke all on function public.servease_create_payment(uuid, uuid, uuid, numeric, text) from public, anon, authenticated;
revoke all on function public.servease_create_review(uuid, uuid, uuid, integer, text) from public, anon, authenticated;

grant execute on function public.servease_create_payment(uuid, uuid, uuid, numeric, text) to service_role;
grant execute on function public.servease_create_review(uuid, uuid, uuid, integer, text) to service_role;
