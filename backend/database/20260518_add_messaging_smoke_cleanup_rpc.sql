-- Service-role helper used by scripts/smoke-messaging.mjs to clean up the
-- synthetic conversation + messages it seeds. The `messages` schema is not
-- exposed through PostgREST, so the smoke script cannot delete rows directly.

create or replace function public.servease_smoke_cleanup_conversation(
  p_conversation_id uuid
)
returns void
language plpgsql
security definer
set search_path = messages, public
as $$
begin
  if p_conversation_id is null then
    return;
  end if;
  delete from messages.messages where conversation_id = p_conversation_id;
  delete from messages.conversations where id = p_conversation_id;
end;
$$;

revoke all on function public.servease_smoke_cleanup_conversation(uuid) from public, anon, authenticated;
grant execute on function public.servease_smoke_cleanup_conversation(uuid) to service_role;
