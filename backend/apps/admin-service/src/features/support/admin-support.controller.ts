import { Body, Controller, Get, HttpException, Param, Patch, Query } from '@nestjs/common';
import { AdminSupportService } from './admin-support.service';
import { SupportTicketSummary } from './admin-support.types';

@Controller('internal/admin/support/tickets')
export class AdminSupportController {
  constructor(private readonly adminSupportService: AdminSupportService) {}

  @Get()
  async list(@Query('status') status?: string): Promise<{ data: SupportTicketSummary[] }> {
    try {
      return {
        data: await this.adminSupportService.listTickets(status ?? null),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin support workflow failed.',
        503,
      );
    }
  }

  @Get(':ticketId')
  async get(
    @Param('ticketId') ticketId: string,
  ): Promise<{ data: SupportTicketSummary }> {
    try {
      return {
        data: await this.adminSupportService.getTicket(ticketId),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin support workflow failed.',
        503,
      );
    }
  }

  @Patch(':ticketId/status')
  async updateStatus(
    @Param('ticketId') ticketId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: SupportTicketSummary }> {
    try {
      return {
        data: await this.adminSupportService.updateTicketStatus(
          ticketId,
          body.status ?? '',
        ),
      };
    } catch {
      throw this.error(
        'admin_dependency_unavailable',
        'Admin support workflow failed.',
        503,
      );
    }
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
