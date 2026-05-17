import { Body, Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import {
  ConversationForbiddenError,
  ConversationNotFoundError,
  InvalidMessagingRequestError,
} from './conversation.errors';
import { ConversationService } from './conversation.service';
import {
  ConversationMessage,
  ConversationSummary,
  MessageSenderRole,
} from './conversation.types';

@Controller('internal/conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async list(
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
  ): Promise<{ data: ConversationSummary[] }> {
    try {
      return {
        data: await this.conversationService.listConversations({
          customerId: customerId ?? null,
          providerId: providerId ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async open(
    @Body() body: { bookingId: string; customerId: string; providerId: string },
  ): Promise<{ data: ConversationSummary }> {
    try {
      return {
        data: await this.conversationService.getOrCreateConversation(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':conversationId')
  async show(
    @Param('conversationId') conversationId: string,
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
  ): Promise<{ data: ConversationSummary }> {
    try {
      return {
        data: await this.conversationService.findConversation(conversationId, {
          customerId: customerId ?? null,
          providerId: providerId ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':conversationId/messages')
  async messages(
    @Param('conversationId') conversationId: string,
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
  ): Promise<{ data: ConversationMessage[] }> {
    try {
      return {
        data: await this.conversationService.listMessages(conversationId, {
          customerId: customerId ?? null,
          providerId: providerId ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':conversationId/messages')
  async createMessage(
    @Param('conversationId') conversationId: string,
    @Body()
    body: {
      senderId: string;
      senderRole: MessageSenderRole;
      content: string;
      attachment?: {
        fileUrl: string;
        fileName?: string | null;
        mimeType?: string | null;
        storagePath?: string | null;
        fileSize?: number | null;
      } | null;
      customerId?: string | null;
      providerId?: string | null;
    },
  ): Promise<{ data: ConversationMessage }> {
    try {
      return {
        data: await this.conversationService.createMessage({
          conversationId,
          senderId: body.senderId,
          senderRole: body.senderRole,
          content: body.content,
          attachment: body.attachment ?? null,
          customerId: body.customerId ?? null,
          providerId: body.providerId ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidMessagingRequestError) {
      return this.error('invalid_messaging_request', 'Messaging request is invalid.', 400);
    }

    if (error instanceof ConversationForbiddenError) {
      return this.error('conversation_forbidden', 'Conversation is not visible.', 403);
    }

    if (error instanceof ConversationNotFoundError) {
      return this.error('conversation_not_found', 'Conversation was not found.', 404);
    }

    return this.error(
      'messaging_dependency_unavailable',
      'Messaging service failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException(
      {
        error: {
          code,
          message,
          details: {},
        },
      },
      status,
    );
  }
}
