create unique index if not exists conversations_booking_id_unique
  on messages.conversations (booking_id)
  where booking_id is not null;

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
begin
  if p_booking_id is null or p_customer_id is null or p_provider_id is null then
    raise exception 'invalid_messaging_request';
  end if;

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
  on conflict (booking_id) where booking_id is not null
  do update set
    customer_id = excluded.customer_id,
    provider_id = excluded.provider_id
  where conversations.booking_id = excluded.booking_id;

  return query
    select
      c.id,
      c.booking_id,
      c.customer_id,
      c.provider_id,
      c.last_message_at,
      c.created_at
    from messages.conversations c
    where c.booking_id = p_booking_id
    limit 1;
end;
$$;

create or replace function public.servease_list_conversations(
  p_customer_id uuid default null,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  booking_id uuid,
  customer_id uuid,
  provider_id uuid,
  last_message_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = messages, public
as $$
  select
    c.id,
    c.booking_id,
    c.customer_id,
    c.provider_id,
    c.last_message_at,
    c.created_at
  from messages.conversations c
  where (p_customer_id is not null and c.customer_id = p_customer_id)
     or (p_provider_id is not null and c.provider_id = p_provider_id)
  order by c.last_message_at desc nulls last, c.created_at desc nulls last
  limit 50;
$$;

create or replace function public.servease_get_visible_conversation(
  p_conversation_id uuid,
  p_customer_id uuid default null,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  booking_id uuid,
  customer_id uuid,
  provider_id uuid,
  last_message_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = messages, public
as $$
  select
    c.id,
    c.booking_id,
    c.customer_id,
    c.provider_id,
    c.last_message_at,
    c.created_at
  from messages.conversations c
  where c.id = p_conversation_id
    and (
      (p_customer_id is not null and c.customer_id = p_customer_id)
      or (p_provider_id is not null and c.provider_id = p_provider_id)
    )
  limit 1;
$$;

create or replace function public.servease_list_conversation_messages(
  p_conversation_id uuid,
  p_customer_id uuid default null,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  conversation_id uuid,
  sender_id uuid,
  sender_role text,
  content text,
  delivery_status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = messages, public
as $$
begin
  if not exists (
    select 1
    from messages.conversations c
    where c.id = p_conversation_id
      and (
        (p_customer_id is not null and c.customer_id = p_customer_id)
        or (p_provider_id is not null and c.provider_id = p_provider_id)
      )
  ) then
    raise exception 'conversation_forbidden';
  end if;

  return query
    select
      m.id,
      m.conversation_id,
      m.sender_id,
      m.sender_role,
      m.content,
      m.delivery_status,
      m.created_at
    from messages.messages m
    where m.conversation_id = p_conversation_id
    order by m.created_at asc nulls last
    limit 100;
end;
$$;

create or replace function public.servease_create_conversation_message(
  p_conversation_id uuid,
  p_sender_id uuid,
  p_sender_role text,
  p_content text,
  p_customer_id uuid default null,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  conversation_id uuid,
  sender_id uuid,
  sender_role text,
  content text,
  delivery_status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = messages, public
as $$
begin
  if p_sender_id is null
    or p_sender_role not in ('customer', 'provider')
    or nullif(trim(p_content), '') is null then
    raise exception 'invalid_messaging_request';
  end if;

  if not exists (
    select 1
    from messages.conversations c
    where c.id = p_conversation_id
      and (
        (p_customer_id is not null and c.customer_id = p_customer_id)
        or (p_provider_id is not null and c.provider_id = p_provider_id)
      )
  ) then
    raise exception 'conversation_forbidden';
  end if;

  return query
    with inserted as (
      insert into messages.messages (
        conversation_id,
        sender_id,
        sender_role,
        content,
        delivery_status
      )
      values (
        p_conversation_id,
        p_sender_id,
        p_sender_role,
        trim(p_content),
        'sent'
      )
      returning
        messages.messages.id,
        messages.messages.conversation_id,
        messages.messages.sender_id,
        messages.messages.sender_role,
        messages.messages.content,
        messages.messages.delivery_status,
        messages.messages.created_at
    ),
    updated as (
      update messages.conversations c
      set last_message_at = (select i.created_at from inserted i limit 1)
      where c.id = p_conversation_id
      returning c.id
    )
    select
      i.id,
      i.conversation_id,
      i.sender_id,
      i.sender_role,
      i.content,
      i.delivery_status,
      i.created_at
    from inserted i;
end;
$$;

revoke all on function public.servease_get_or_create_conversation(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_list_conversations(uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_get_visible_conversation(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_list_conversation_messages(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_create_conversation_message(uuid, uuid, text, text, uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_get_or_create_conversation(uuid, uuid, uuid) to service_role;
grant execute on function public.servease_list_conversations(uuid, uuid) to service_role;
grant execute on function public.servease_get_visible_conversation(uuid, uuid, uuid) to service_role;
grant execute on function public.servease_list_conversation_messages(uuid, uuid, uuid) to service_role;
grant execute on function public.servease_create_conversation_message(uuid, uuid, text, text, uuid, uuid) to service_role;
