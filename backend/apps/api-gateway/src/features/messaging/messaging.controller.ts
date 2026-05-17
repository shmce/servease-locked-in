import { Body, Controller, Get, Headers, HttpException, Param, Post } from '@nestjs/common';
import { BookingGatewayService } from '../booking/booking.service';
import { BookingNotFoundError } from '../booking/booking.errors';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  ConversationForbiddenError,
  ConversationNotFoundError,
  InvalidMessagingRequestError,
  MessagingDependencyUnavailableError,
} from './messaging.errors';
import { MessagingGatewayService } from './messaging.service';
import {
  ConversationMessage,
  ConversationSummary,
  ConversationVisibility,
  MessageSenderRole,
} from './messaging.types';

@Controller('v1/conversations')
export class MessagingController {
  constructor(
    private readonly messagingGatewayService: MessagingGatewayService,
    private readonly bookingGatewayService: BookingGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly catalogServiceClient: CatalogServiceClient,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: ConversationSummary[] }> {
    try {
      const participant = await this.resolveParticipant(authorization);
      return {
        data: await this.messagingGatewayService.listConversations(
          participant.visibility,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async open(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: { bookingId?: string },
  ): Promise<{ data: ConversationSummary }> {
    try {
      if (!body.bookingId) {
        throw new InvalidMessagingRequestError();
      }

      const participant = await this.resolveParticipant(authorization);
      const booking = await this.bookingGatewayService.findBooking(
        body.bookingId,
        participant.userId,
        participant.visibility.providerId,
      );

      return {
        data: await this.messagingGatewayService.getOrCreateConversation({
          bookingId: booking.id,
          customerId: booking.customerId,
          providerId: booking.providerId,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':conversationId/messages')
  async messages(
    @Headers('authorization') authorization: string | undefined,
    @Param('conversationId') conversationId: string,
  ): Promise<{ data: ConversationMessage[] }> {
    try {
      const participant = await this.resolveParticipant(authorization);
      return {
        data: await this.messagingGatewayService.listMessages(
          conversationId,
          participant.visibility,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':conversationId/messages')
  async createMessage(
    @Headers('authorization') authorization: string | undefined,
    @Param('conversationId') conversationId: string,
    @Body()
    body: {
      content?: string;
      attachment?: {
        fileUrl?: string;
        fileName?: string | null;
        mimeType?: string | null;
        storagePath?: string | null;
        fileSize?: number | null;
      } | null;
    },
  ): Promise<{ data: ConversationMessage }> {
    try {
      if (!body.content?.trim() && !body.attachment?.fileUrl?.trim()) {
        throw new InvalidMessagingRequestError();
      }

      const participant = await this.resolveParticipant(authorization);
      const conversation = await this.messagingGatewayService.findConversation(
        conversationId,
        participant.visibility,
      );
      const senderRole = this.resolveSenderRole(
        participant.userId,
        participant.visibility.providerId,
        conversation,
      );

      return {
        data: await this.messagingGatewayService.createMessage({
          conversationId,
          senderId: participant.userId,
          senderRole,
          content: body.content?.trim() || 'Sent an attachment',
          attachment: body.attachment?.fileUrl?.trim()
            ? {
                fileUrl: body.attachment.fileUrl.trim(),
                fileName: body.attachment.fileName?.trim() || null,
                mimeType: body.attachment.mimeType?.trim() || null,
                storagePath: body.attachment.storagePath?.trim() || null,
                fileSize:
                  body.attachment.fileSize === undefined ||
                  body.attachment.fileSize === null
                    ? null
                    : Number(body.attachment.fileSize),
              }
            : null,
          customerId: participant.visibility.customerId,
          providerId: participant.visibility.providerId,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async resolveParticipant(
    authorization: string | undefined,
  ): Promise<{
    userId: string;
    visibility: ConversationVisibility;
  }> {
    const userId = await this.authTokenService.authenticate(authorization);
    const providerProfile =
      await this.catalogServiceClient.findProviderProfileByUserId(userId);

    return {
      userId,
      visibility: {
        customerId: userId,
        providerId: providerProfile?.id ?? null,
      },
    };
  }

  private resolveSenderRole(
    userId: string,
    providerId: string | null,
    conversation: ConversationSummary,
  ): MessageSenderRole {
    if (conversation.customerId === userId) {
      return 'customer';
    }

    if (providerId && conversation.providerId === providerId) {
      return 'provider';
    }

    throw new ConversationForbiddenError();
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof InvalidMessagingRequestError) {
      return this.error('invalid_messaging_request', 'Messaging request is invalid.', 400);
    }

    if (error instanceof ConversationForbiddenError) {
      return this.error('conversation_forbidden', 'Conversation is not visible.', 403);
    }

    if (error instanceof ConversationNotFoundError) {
      return this.error('conversation_not_found', 'Conversation was not found.', 404);
    }

    if (error instanceof BookingNotFoundError) {
      return this.error('booking_not_found', 'Booking was not found.', 404);
    }

    if (error instanceof MessagingDependencyUnavailableError) {
      return this.error(
        'messaging_dependency_unavailable',
        'Messaging service is unavailable.',
        503,
      );
    }

    return this.error('messaging_dependency_unavailable', 'Messaging failed.', 503);
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
