import { SupabaseConversationRepository } from './supabase-conversation.repository';

describe('SupabaseConversationRepository', () => {
  it('gets or creates a booking conversation through the service RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'conversation-1',
        booking_id: 'booking-1',
        customer_id: 'customer-1',
        provider_id: 'provider-1',
        last_message_at: '2026-05-15T10:00:00.000Z',
        created_at: '2026-05-15T09:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseConversationRepository({ rpc });

    const conversation = await repository.getOrCreateConversation({
      bookingId: 'booking-1',
      customerId: 'customer-1',
      providerId: 'provider-1',
    });

    expect(rpc).toHaveBeenCalledWith('servease_get_or_create_conversation', {
      p_booking_id: 'booking-1',
      p_customer_id: 'customer-1',
      p_provider_id: 'provider-1',
    });
    expect(conversation).toEqual({
      id: 'conversation-1',
      bookingId: 'booking-1',
      customerId: 'customer-1',
      providerId: 'provider-1',
      lastMessageAt: '2026-05-15T10:00:00.000Z',
      createdAt: '2026-05-15T09:00:00.000Z',
    });
  });

  it('creates a message with participant visibility ids', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'message-1',
        conversation_id: 'conversation-1',
        sender_id: 'customer-1',
        sender_role: 'customer',
        content: 'Hello',
        delivery_status: 'sent',
        created_at: '2026-05-15T10:00:00.000Z',
        attachment: null,
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseConversationRepository({ rpc });

    const message = await repository.createMessage({
      conversationId: 'conversation-1',
      senderId: 'customer-1',
      senderRole: 'customer',
      content: 'Hello',
      customerId: 'customer-1',
      providerId: null,
    });

    expect(rpc).toHaveBeenCalledWith('servease_create_conversation_message', {
      p_conversation_id: 'conversation-1',
      p_sender_id: 'customer-1',
      p_sender_role: 'customer',
      p_content: 'Hello',
      p_customer_id: 'customer-1',
      p_provider_id: null,
      p_attachment: null,
    });
    expect(message.content).toBe('Hello');
  });
});
