import { Body, Controller, Get, Headers, HttpException, Param, Post } from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  InvalidSupportTicketRequestError,
  SupportDependencyUnavailableError,
} from './support.errors';
import { SupportGatewayService } from './support.service';
import { SupportTicketReplySummary, SupportTicketSummary } from './support.types';

@Controller('v1/support/tickets')
export class SupportController {
  constructor(
    private readonly supportGatewayService: SupportGatewayService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: SupportTicketSummary[] }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.supportGatewayService.listTickets(userId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body()
    body: {
      subject?: string;
      message?: string | null;
      category?: string | null;
      attachments?: Array<{
        fileUrl: string;
        fileName?: string | null;
        mimeType?: string | null;
        storagePath?: string | null;
        fileSize?: number | null;
      }>;
    },
  ): Promise<{ data: SupportTicketSummary }> {
    try {
      if (
        !body.subject?.trim() ||
        body.attachments?.some((attachment) => !attachment.fileUrl?.trim())
      ) {
        throw new InvalidSupportTicketRequestError();
      }

      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.supportGatewayService.createTicket({
          userId,
          subject: body.subject,
          message: body.message ?? null,
          category: body.category ?? null,
          attachments: body.attachments ?? [],
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':ticketId/replies')
  async listReplies(
    @Headers('authorization') authorization: string | undefined,
    @Param('ticketId') ticketId: string,
  ): Promise<{ data: SupportTicketReplySummary[] }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.supportGatewayService.listReplies(userId, ticketId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':ticketId/replies')
  async addReply(
    @Headers('authorization') authorization: string | undefined,
    @Param('ticketId') ticketId: string,
    @Body() body: { message?: string },
  ): Promise<{ data: SupportTicketReplySummary }> {
    try {
      if (!body.message?.trim()) {
        throw new InvalidSupportTicketRequestError();
      }
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.supportGatewayService.addReply(
          userId,
          ticketId,
          body.message,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':ticketId')
  async show(
    @Headers('authorization') authorization: string | undefined,
    @Param('ticketId') ticketId: string,
  ): Promise<{ data: SupportTicketSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.supportGatewayService.getTicket(userId, ticketId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof InvalidSupportTicketRequestError) {
      return this.error(
        'invalid_support_ticket_request',
        'Support ticket request is invalid.',
        400,
      );
    }

    if (error instanceof SupportDependencyUnavailableError) {
      return this.error(
        'support_dependency_unavailable',
        'Support service is unavailable.',
        503,
      );
    }

    return this.error('support_dependency_unavailable', 'Support failed.', 503);
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
