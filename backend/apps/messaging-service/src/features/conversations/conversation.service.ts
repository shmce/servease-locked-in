import { Injectable } from '@nestjs/common';
import { InvalidMessagingRequestError } from './conversation.errors';
import {
  ConversationMessage,
  ConversationSummary,
  ConversationVisibility,
  CreateConversationMessageInput,
  GetOrCreateConversationInput,
} from './conversation.types';
import { SupabaseConversationRepository } from './supabase-conversation.repository';

@Injectable()
export class ConversationService {
  constructor(private readonly conversationRepository: SupabaseConversationRepository) {}

  async getOrCreateConversation(
    input: GetOrCreateConversationInput,
  ): Promise<ConversationSummary> {
    if (!input.bookingId || !input.customerId || !input.providerId) {
      throw new InvalidMessagingRequestError();
    }
    return this.conversationRepository.getOrCreateConversation(input);
  }

  async listConversations(
    visibility: ConversationVisibility,
  ): Promise<ConversationSummary[]> {
    return this.conversationRepository.listConversations(visibility);
  }

  async findConversation(
    conversationId: string,
    visibility: ConversationVisibility,
  ): Promise<ConversationSummary> {
    if (!conversationId) {
      throw new InvalidMessagingRequestError();
    }
    return this.conversationRepository.findConversation(conversationId, visibility);
  }

  async listMessages(
    conversationId: string,
    visibility: ConversationVisibility,
  ): Promise<ConversationMessage[]> {
    if (!conversationId) {
      throw new InvalidMessagingRequestError();
    }
    return this.conversationRepository.listMessages(conversationId, visibility);
  }

  async createMessage(
    input: CreateConversationMessageInput,
  ): Promise<ConversationMessage> {
    const content = input.content.trim();
    if (
      !input.conversationId ||
      !input.senderId ||
      (!content && !input.attachment?.fileUrl?.trim())
    ) {
      throw new InvalidMessagingRequestError();
    }

    return this.conversationRepository.createMessage({
      ...input,
      content,
      attachment: input.attachment?.fileUrl?.trim()
        ? {
            fileUrl: input.attachment.fileUrl.trim(),
            fileName: input.attachment.fileName?.trim() || null,
            mimeType: input.attachment.mimeType?.trim() || null,
            storagePath: input.attachment.storagePath?.trim() || null,
            fileSize:
              input.attachment.fileSize === undefined ||
              input.attachment.fileSize === null
                ? null
                : Number(input.attachment.fileSize),
          }
        : null,
    });
  }
}
