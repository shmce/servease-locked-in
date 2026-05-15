import { Body, Controller, Get, HttpException, Post, Query } from '@nestjs/common';
import {
  InvalidSupportTicketRequestError,
  SupportTicketNotFoundError,
} from './ticket.errors';
import { SupportTicketService } from './ticket.service';
import { SupportTicketSummary } from './ticket.types';

@Controller('internal/support/tickets')
export class SupportTicketController {
  constructor(private readonly ticketService: SupportTicketService) {}

  @Get()
  async list(@Query('userId') userId?: string): Promise<{ data: SupportTicketSummary[] }> {
    try {
      return {
        data: await this.ticketService.listTickets(userId ?? ''),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async create(
    @Body()
    body: {
      userId: string;
      subject: string;
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
      return {
        data: await this.ticketService.createTicket(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidSupportTicketRequestError) {
      return this.error(
        'invalid_support_ticket_request',
        'Support ticket request is invalid.',
        400,
      );
    }

    if (error instanceof SupportTicketNotFoundError) {
      return this.error('support_ticket_not_found', 'Support ticket was not found.', 404);
    }

    return this.error(
      'support_dependency_unavailable',
      'Support service failed.',
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
