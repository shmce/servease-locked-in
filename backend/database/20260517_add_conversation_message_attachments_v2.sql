-- v2: drops list+create functions first because PostgreSQL refuses to change
-- the OUT-parameter shape of an existing function via CREATE OR REPLACE.

alter table messages.messages
  add column if not exists attachment_url text,
  add column if not exists attachment_file_name text,
  add column if not exists attachment_mime_type text,
  add column if not exists attachment_storage_path text,
  add column if not exists attachment_size integer;

drop function if exists public.servease_list_conversation_messages(uuid, uuid, uuid);
drop function if exists public.servease_create_conversation_message(uuid, uuid, text, text, uuid, uuid);
drop function if exists public.servease_create_conversation_message(uuid, uuid, text, text, uuid, uuid, jsonb);

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
  created_at timestamptz,
  attachment jsonb
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
      m.created_at,
      case
        when m.attachment_url is null then null
        else jsonb_build_object(
          'fileUrl', m.attachment_url,
          'fileName', m.attachment_file_name,
          'mimeType', m.attachment_mime_type,
          'storagePath', m.attachment_storage_path,
          'fileSize', m.attachment_size
        )
      end as attachment
    from messages.messages m
    where m.conversation_id = p_conversation_id
    order by m.created_at asc nulls last
    limit 100;
end;
$$;

drop function if exists public.servease_create_conversation_message(uuid, uuid, text, text, uuid, uuid);

create or replace function public.servease_create_conversation_message(
  p_conversation_id uuid,
  p_sender_id uuid,
  p_sender_role text,
  p_content text,
  p_customer_id uuid default null,
  p_provider_id uuid default null,
  p_attachment jsonb default null
)
returns table (
  id uuid,
  conversation_id uuid,
  sender_id uuid,
  sender_role text,
  content text,
  delivery_status text,
  created_at timestamptz,
  attachment jsonb
)
language plpgsql
security definer
set search_path = messages, public
as $$
declare
  v_attachment_url text := nullif(trim(coalesce(p_attachment ->> 'fileUrl', '')), '');
begin
  if p_sender_id is null
    or p_sender_role not in ('customer', 'provider')
    or (nullif(trim(coalesce(p_content, '')), '') is null and v_attachment_url is null) then
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
        delivery_status,
        attachment_url,
        attachment_file_name,
        attachment_mime_type,
        attachment_storage_path,
        attachment_size
      )
      values (
        p_conversation_id,
        p_sender_id,
        p_sender_role,
        coalesce(nullif(trim(coalesce(p_content, '')), ''), 'Sent an attachment'),
        'sent',
        v_attachment_url,
        nullif(trim(coalesce(p_attachment ->> 'fileName', '')), ''),
        nullif(trim(coalesce(p_attachment ->> 'mimeType', '')), ''),
        nullif(trim(coalesce(p_attachment ->> 'storagePath', '')), ''),
        nullif(trim(coalesce(p_attachment ->> 'fileSize', '')), '')::integer
      )
      returning
        messages.messages.id,
        messages.messages.conversation_id,
        messages.messages.sender_id,
        messages.messages.sender_role,
        messages.messages.content,
        messages.messages.delivery_status,
        messages.messages.created_at,
        messages.messages.attachment_url,
        messages.messages.attachment_file_name,
        messages.messages.attachment_mime_type,
        messages.messages.attachment_storage_path,
        messages.messages.attachment_size
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
      i.created_at,
      case
        when i.attachment_url is null then null
        else jsonb_build_object(
          'fileUrl', i.attachment_url,
          'fileName', i.attachment_file_name,
          'mimeType', i.attachment_mime_type,
          'storagePath', i.attachment_storage_path,
          'fileSize', i.attachment_size
        )
      end as attachment
    from inserted i;
end;
$$;

revoke all on function public.servease_create_conversation_message(uuid, uuid, text, text, uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.servease_create_conversation_message(uuid, uuid, text, text, uuid, uuid, jsonb) to service_role;
