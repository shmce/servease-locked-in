create or replace function public.servease_get_or_create_conversation(
  p_booking_id uuid,
  p_customer_id uuid,
  p_provider_id uuid
)
returns table (
  id uuid,
  booking_id uuid,
  customer_id uuid,
  provider_id uuid,
  last_message_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = messages, public
as $$
declare
  v_conversation_id uuid;
begin
  if p_booking_id is null or p_customer_id is null or p_provider_id is null then
    raise exception 'invalid_messaging_request';
  end if;

  update messages.conversations c
  set
    customer_id = p_customer_id,
    provider_id = p_provider_id
  where c.booking_id = p_booking_id
  returning c.id into v_conversation_id;

  if v_conversation_id is null then
    begin
      insert into messages.conversations (
        booking_id,
        customer_id,
        provider_id,
        last_message_at
      )
      values (
        p_booking_id,
        p_customer_id,
        p_provider_id,
        null
      )
      returning messages.conversations.id into v_conversation_id;
    exception
      when unique_violation then
        update messages.conversations c
        set
          customer_id = p_customer_id,
          provider_id = p_provider_id
        where c.booking_id = p_booking_id
        returning c.id into v_conversation_id;
    end;
  end if;

  return query
    select
      c.id,
      c.booking_id,
      c.customer_id,
      c.provider_id,
      c.last_message_at,
      c.created_at
    from messages.conversations c
    where c.id = v_conversation_id
    limit 1;
end;
$$;

revoke all on function public.servease_get_or_create_conversation(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.servease_get_or_create_conversation(uuid, uuid, uuid) to service_role;
