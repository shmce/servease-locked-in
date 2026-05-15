import { Injectable } from '@nestjs/common';
import { MessagingServiceClient } from './clients/messaging-service.client';
import {
  ConversationMessage,
  ConversationSummary,
  ConversationVisibility,
  CreateConversationMessageRequest,
  GetOrCreateConversationRequest,
} from './messaging.types';

@Injectable()
export class MessagingGatewayService {
  constructor(private readonly messagingServiceClient: MessagingServiceClient) {}

  getOrCreateConversation(
    input: GetOrCreateConversationRequest,
  ): Promise<ConversationSummary> {
    return this.messagingServiceClient.getOrCreateConversation(input);
  }

  listConversations(
    visibility: ConversationVisibility,
  ): Promise<ConversationSummary[]> {
    return this.messagingServiceClient.listConversations(visibility);
  }

  findConversation(
    conversationId: string,
    visibility: ConversationVisibility,
  ): Promise<ConversationSummary> {
    return this.messagingServiceClient.findConversation(conversationId, visibility);
  }

  listMessages(
    conversationId: string,
    visibility: ConversationVisibility,
  ): Promise<ConversationMessage[]> {
    return this.messagingServiceClient.listMessages(conversationId, visibility);
  }

  createMessage(
    input: CreateConversationMessageRequest,
  ): Promise<ConversationMessage> {
    return this.messagingServiceClient.createMessage(input);
  }
}
