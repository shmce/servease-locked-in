import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  ConversationForbiddenError,
  ConversationNotFoundError,
} from './conversation.errors';
import {
  ConversationMessage,
  ConversationSummary,
  ConversationVisibility,
  CreateConversationMessageInput,
  GetOrCreateConversationInput,
  MessageSenderRole,
} from './conversation.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, unknown>,
  ): PromiseLike<{
    data: ConversationRow[] | MessageRow[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: ConversationRow | MessageRow | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface ConversationRow {
  id: string;
  booking_id: string | null;
  customer_id: string | null;
  provider_id: string | null;
  last_message_at: string | null;
  created_at: string | null;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: MessageSenderRole;
  content: string;
  delivery_status: string | null;
  created_at: string | null;
  attachment?: {
    fileUrl?: string | null;
    fileName?: string | null;
    mimeType?: string | null;
    storagePath?: string | null;
    fileSize?: number | null;
  } | null;
}

@Injectable()
export class SupabaseConversationRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async getOrCreateConversation(
    input: GetOrCreateConversationInput,
  ): Promise<ConversationSummary> {
    const { data, error } = await this.client
      .rpc('servease_get_or_create_conversation', {
        p_booking_id: input.bookingId,
        p_customer_id: input.customerId,
        p_provider_id: input.providerId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get or create conversation: ${error.message}`);
    }

    if (!data) {
      throw new ConversationNotFoundError();
    }

    return this.mapConversation(data as ConversationRow);
  }

  async listConversations(
    visibility: ConversationVisibility,
  ): Promise<ConversationSummary[]> {
    const { data, error } = await this.client.rpc('servease_list_conversations', {
      p_customer_id: visibility.customerId,
      p_provider_id: visibility.providerId,
    });

    if (error) {
      throw new Error(`Failed to list conversations: ${error.message}`);
    }

    return ((data ?? []) as ConversationRow[]).map((row) =>
      this.mapConversation(row),
    );
  }

  async findConversation(
    conversationId: string,
    visibility: ConversationVisibility,
  ): Promise<ConversationSummary> {
    const { data, error } = await this.client
      .rpc('servease_get_visible_conversation', {
        p_conversation_id: conversationId,
        p_customer_id: visibility.customerId,
        p_provider_id: visibility.providerId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load conversation: ${error.message}`);
    }

    if (!data) {
      throw new ConversationNotFoundError();
    }

    return this.mapConversation(data as ConversationRow);
  }

  async listMessages(
    conversationId: string,
    visibility: ConversationVisibility,
  ): Promise<ConversationMessage[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_conversation_messages',
      {
        p_conversation_id: conversationId,
        p_customer_id: visibility.customerId,
        p_provider_id: visibility.providerId,
      },
    );

    if (error) {
      if (error.message.includes('conversation_forbidden')) {
        throw new ConversationForbiddenError();
      }
      throw new Error(`Failed to list messages: ${error.message}`);
    }

    return ((data ?? []) as MessageRow[]).map((row) => this.mapMessage(row));
  }

  async createMessage(
    input: CreateConversationMessageInput,
  ): Promise<ConversationMessage> {
    const { data, error } = await this.client
      .rpc('servease_create_conversation_message', {
        p_conversation_id: input.conversationId,
        p_sender_id: input.senderId,
        p_sender_role: input.senderRole,
        p_content: input.content,
        p_customer_id: input.customerId,
        p_provider_id: input.providerId,
        p_attachment: input.attachment ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('conversation_forbidden')) {
        throw new ConversationForbiddenError();
      }
      throw new Error(`Failed to create message: ${error.message}`);
    }

    if (!data) {
      throw new ConversationNotFoundError();
    }

    return this.mapMessage(data as MessageRow);
  }

  private mapConversation(row: ConversationRow): ConversationSummary {
    return {
      id: row.id,
      bookingId: row.booking_id,
      customerId: row.customer_id,
      providerId: row.provider_id,
      lastMessageAt: row.last_message_at,
      createdAt: row.created_at,
    };
  }

  private mapMessage(row: MessageRow): ConversationMessage {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderRole: row.sender_role,
      content: row.content,
      deliveryStatus: row.delivery_status,
      createdAt: row.created_at,
      attachment: row.attachment?.fileUrl
        ? {
            fileUrl: row.attachment.fileUrl,
            fileName: row.attachment.fileName ?? null,
            mimeType: row.attachment.mimeType ?? null,
            storagePath: row.attachment.storagePath ?? null,
            fileSize: row.attachment.fileSize ?? null,
          }
        : null,
    };
  }
}
