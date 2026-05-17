import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConversationForbiddenError,
  ConversationNotFoundError,
  MessagingDependencyUnavailableError,
} from '../messaging.errors';
import {
  ConversationMessage,
  ConversationSummary,
  ConversationVisibility,
  CreateConversationMessageRequest,
  GetOrCreateConversationRequest,
} from '../messaging.types';

@Injectable()
export class MessagingServiceClient {
  constructor(private readonly configService: ConfigService) {}

  getOrCreateConversation(
    input: GetOrCreateConversationRequest,
  ): Promise<ConversationSummary> {
    return this.request<ConversationSummary>('/internal/conversations', 'POST', input);
  }

  listConversations(
    visibility: ConversationVisibility,
  ): Promise<ConversationSummary[]> {
    const searchParams = this.visibilitySearchParams(visibility);
    return this.request<ConversationSummary[]>(
      `/internal/conversations?${searchParams.toString()}`,
      'GET',
    );
  }

  findConversation(
    conversationId: string,
    visibility: ConversationVisibility,
  ): Promise<ConversationSummary> {
    const searchParams = this.visibilitySearchParams(visibility);
    return this.request<ConversationSummary>(
      `/internal/conversations/${conversationId}?${searchParams.toString()}`,
      'GET',
    );
  }

  listMessages(
    conversationId: string,
    visibility: ConversationVisibility,
  ): Promise<ConversationMessage[]> {
    const searchParams = this.visibilitySearchParams(visibility);
    return this.request<ConversationMessage[]>(
      `/internal/conversations/${conversationId}/messages?${searchParams.toString()}`,
      'GET',
    );
  }

  createMessage(
    input: CreateConversationMessageRequest,
  ): Promise<ConversationMessage> {
    return this.request<ConversationMessage>(
      `/internal/conversations/${input.conversationId}/messages`,
      'POST',
      {
        senderId: input.senderId,
        senderRole: input.senderRole,
        content: input.content,
        attachment: input.attachment ?? null,
        customerId: input.customerId,
        providerId: input.providerId,
      },
    );
  }

  private visibilitySearchParams(
    visibility: ConversationVisibility,
  ): URLSearchParams {
    const searchParams = new URLSearchParams();
    if (visibility.customerId) {
      searchParams.set('customerId', visibility.customerId);
    }
    if (visibility.providerId) {
      searchParams.set('providerId', visibility.providerId);
    }
    return searchParams;
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'MESSAGING_SERVICE_URL',
      'http://localhost:8506',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      const code = await this.readErrorCode(response);
      if (code === 'conversation_not_found') {
        throw new ConversationNotFoundError();
      }
      if (code === 'conversation_forbidden') {
        throw new ConversationForbiddenError();
      }
      throw new MessagingDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  private async readErrorCode(response: Response): Promise<string | null> {
    try {
      const payload = (await response.json()) as {
        error?: {
          code?: string;
        };
      };
      return payload.error?.code ?? null;
    } catch {
      return null;
    }
  }
}
