import { Body, Controller, Get, HttpException, Param, Patch, Query } from '@nestjs/common';
import {
  InvalidSupportTicketRequestError,
  SupportTicketNotFoundError,
} from './ticket.errors';
import { SupportTicketAdminService } from './ticket-admin.service';
import { SupportTicketSummary } from './ticket.types';

@Controller('internal/admin/support/tickets')
export class SupportTicketAdminController {
  constructor(private readonly ticketAdminService: SupportTicketAdminService) {}

  @Get()
  async list(@Query('status') status?: string): Promise<{ data: SupportTicketSummary[] }> {
    try {
      return {
        data: await this.ticketAdminService.listTickets(status ?? null),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':ticketId/status')
  async updateStatus(
    @Param('ticketId') ticketId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: SupportTicketSummary }> {
    try {
      return {
        data: await this.ticketAdminService.updateTicketStatus(
          ticketId,
          body.status ?? '',
        ),
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
