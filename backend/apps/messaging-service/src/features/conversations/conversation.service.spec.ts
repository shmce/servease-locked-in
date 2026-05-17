import { InvalidMessagingRequestError } from './conversation.errors';
import { ConversationService } from './conversation.service';
import { SupabaseConversationRepository } from './supabase-conversation.repository';

describe('ConversationService', () => {
  it('rejects empty message content before repository writes', async () => {
    const repository = {
      createMessage: jest.fn(),
    } as unknown as SupabaseConversationRepository;
    const service = new ConversationService(repository);

    await expect(
      service.createMessage({
        conversationId: 'conversation-1',
        senderId: 'customer-1',
        senderRole: 'customer',
        content: '   ',
        customerId: 'customer-1',
        providerId: null,
      }),
    ).rejects.toBeInstanceOf(InvalidMessagingRequestError);
    expect(repository.createMessage).not.toHaveBeenCalled();
  });

  it('trims message content before persistence', async () => {
    const repository = {
      createMessage: jest.fn().mockResolvedValue({
        id: 'message-1',
        content: 'Hello',
      }),
    } as unknown as SupabaseConversationRepository;
    const service = new ConversationService(repository);

    await service.createMessage({
      conversationId: 'conversation-1',
      senderId: 'customer-1',
      senderRole: 'customer',
      content: '  Hello  ',
      customerId: 'customer-1',
      providerId: null,
    });

    expect(repository.createMessage).toHaveBeenCalledWith({
      conversationId: 'conversation-1',
      senderId: 'customer-1',
      senderRole: 'customer',
      content: 'Hello',
      customerId: 'customer-1',
      providerId: null,
      attachment: null,
    });
  });
});
