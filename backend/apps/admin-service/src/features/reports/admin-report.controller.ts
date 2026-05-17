import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Query,
} from '@nestjs/common';
import { InvalidAdminReportScheduleRequestError } from './admin-report.errors';
import { AdminReportDeliveryService } from './admin-report-delivery.service';
import { AdminReportService } from './admin-report.service';
import {
  AdminReportDeliverySummary,
  AdminReportFormat,
  AdminReportFrequency,
  AdminReportScheduleSummary,
  AdminReportType,
} from './admin-report.types';

@Controller('internal/admin/reports')
export class AdminReportController {
  constructor(
    private readonly adminReportService: AdminReportService,
    private readonly adminReportDeliveryService: AdminReportDeliveryService,
  ) {}

  @Get('schedules')
  async listSchedules(
    @Query('type') type?: AdminReportType,
    @Query('limit') limit?: string,
  ): Promise<{ data: AdminReportScheduleSummary[] }> {
    try {
      return {
        data: await this.adminReportService.listSchedules(
          type ?? null,
          limit ? Number(limit) : null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('schedules')
  async createSchedule(
    @Body()
    body: {
      adminUserId?: string;
      type?: AdminReportType;
      format?: AdminReportFormat;
      name?: string;
      frequency?: AdminReportFrequency;
      recipients?: string[];
    },
  ): Promise<{ data: AdminReportScheduleSummary }> {
    try {
      return {
        data: await this.adminReportService.createSchedule({
          adminUserId: body.adminUserId ?? '',
          type: body.type ?? 'bookings',
          format: body.format ?? 'csv',
          name: body.name ?? '',
          frequency: body.frequency ?? 'weekly',
          recipients: body.recipients ?? [],
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('schedules/deliver-due')
  async deliverDueSchedules(): Promise<{ data: AdminReportDeliverySummary }> {
    try {
      return {
        data: await this.adminReportDeliveryService.runDueSchedules(),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidAdminReportScheduleRequestError) {
      return this.error(
        'invalid_admin_report_schedule_request',
        error.message,
        400,
      );
    }

    return this.error(
      'admin_dependency_unavailable',
      'Admin report schedule workflow failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException(
      { error: { code, message, details: {} } },
      status,
    );
  }
}
